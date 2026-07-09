import { useEffect, useRef } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { Map as LeafletMapInstance } from 'leaflet';
import { useIsDark } from '../../theme/useTheme';
import {
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  NL_LEAFLET_BOUNDS,
} from './mapBounds';
import type { ClusterPoint, ViewportBBox } from './useClusters';
import { iconForPoint } from './markerIcons';

const PAN_DEBOUNCE_MS = 500;

const TILES = {
  light: {
    url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

interface Props {
  initialCenter: { latitude: number; longitude: number };
  center: { latitude: number; longitude: number } | null;
  radiusM: number;
  clusters: ClusterPoint[];
  /** Doelcoördinaat om naartoe te vliegen; `zoom` optioneel (bv. cluster openbreken). */
  flyTo: { latitude: number; longitude: number; nonce: number; zoom?: number } | null;
  onViewportChange: (viewport: ViewportBBox) => void;
  onCenterSettled: (center: { latitude: number; longitude: number }) => void;
  onClusterClick: (point: ClusterPoint) => void;
  onObservationClick: (point: ClusterPoint) => void;
}

/** Rapporteert de viewport (bounds + zoom) en het gesettelde middelpunt. */
function ViewportReporter({
  onViewportChange,
  onCenterSettled,
}: {
  onViewportChange: (v: ViewportBBox) => void;
  onCenterSettled: (c: { latitude: number; longitude: number }) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const report = (map: LeafletMapInstance) => {
    const b = map.getBounds();
    onViewportChange({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
      zoom: map.getZoom(),
    });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const c = map.getCenter();
    debounceRef.current = setTimeout(() => {
      onCenterSettled({ latitude: c.lat, longitude: c.lng });
    }, PAN_DEBOUNCE_MS);
  };

  const map = useMapEvents({
    moveend: () => report(map),
    zoomend: () => report(map),
  });

  // Rapporteer de begin-viewport eenmalig bij het monteren van de kaart.
  useEffect(() => {
    report(map);
  }, []);

  return null;
}

/** Vliegt imperatief naar een nieuw doel wanneer `flyTo` verandert. */
function FlyController({
  flyTo,
}: {
  flyTo: { latitude: number; longitude: number; nonce: number; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      const zoom = Math.min(
        MAX_ZOOM,
        // Zonder expliciete zoom: nooit uitzoomen onder het huidige niveau.
        flyTo.zoom ?? Math.max(INITIAL_ZOOM, map.getZoom()),
      );
      map.flyTo([flyTo.latitude, flyTo.longitude], zoom, { duration: 0.6 });
    }
  }, [flyTo, map]);
  return null;
}

/** De Leaflet-kaart met tegels, grenzen, zoekstraal-cirkel en markers. */
export function LeafletMap({
  initialCenter,
  center,
  radiusM,
  clusters,
  flyTo,
  onViewportChange,
  onCenterSettled,
  onClusterClick,
  onObservationClick,
}: Props) {
  const isDark = useIsDark();
  const tiles = isDark ? TILES.dark : TILES.light;
  const circleColor = isDark ? '#52B788' : '#1B4332';

  return (
    <MapContainer
      className="map-container"
      center={[initialCenter.latitude, initialCenter.longitude]}
      zoom={INITIAL_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={NL_LEAFLET_BOUNDS}
      maxBoundsViscosity={1}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        key={isDark ? 'dark' : 'light'}
        url={tiles.url}
        attribution={tiles.attribution}
        detectRetina
      />

      {center ? (
        <Circle
          center={[center.latitude, center.longitude]}
          radius={radiusM}
          pathOptions={{
            color: circleColor,
            weight: 2,
            fillColor: circleColor,
            fillOpacity: isDark ? 0.12 : 0.08,
          }}
        />
      ) : null}

      {clusters.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={iconForPoint(point)}
          eventHandlers={{
            click: () =>
              point.observation
                ? onObservationClick(point)
                : onClusterClick(point),
          }}
        />
      ))}

      <ViewportReporter
        onViewportChange={onViewportChange}
        onCenterSettled={onCenterSettled}
      />
      <FlyController flyTo={flyTo} />
    </MapContainer>
  );
}
