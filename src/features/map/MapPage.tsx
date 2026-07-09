import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nl } from '../../i18n/nl';
import { LeafletMap } from './LeafletMap';
import { ObservationsList } from './ObservationsList';
import { SpeciesGroupChips } from '../filters/SpeciesGroupChips';
import { FilterPanel } from '../filters/FilterPanel';
import { SearchOverlay } from '../search/SearchOverlay';
import { useObservations } from './useObservations';
import { useClusters, type ClusterPoint, type ViewportBBox } from './useClusters';
import { useUserLocation } from './useUserLocation';
import { useFilterStore } from '../filters/filterStore';
import { useMapCenterStore } from './mapCenterStore';
import { FALLBACK_CENTER, INITIAL_ZOOM } from './mapBounds';
import { useOverlayHistory } from '../../utils/useOverlayHistory';
import type { Observation } from '../../api/types';

type LatLng = { latitude: number; longitude: number };

/** Hoofdscherm: kaart met waarnemingen, chips, zoeken, filters en lijst. */
export function MapPage() {
  const navigate = useNavigate();
  const { location, status, request } = useUserLocation();
  const speciesFilter = useFilterStore((s) => s.speciesFilter);
  const setSpeciesFilter = useFilterStore((s) => s.setSpeciesFilter);
  const radiusM = useFilterStore((s) => s.radius);
  const pendingCenter = useMapCenterStore((s) => s.pendingCenter);
  const setPendingCenter = useMapCenterStore((s) => s.setPendingCenter);

  const [center, setCenter] = useState<LatLng | null>(null);
  const [viewport, setViewport] = useState<ViewportBBox | null>(null);
  const [flyTo, setFlyTo] = useState<
    (LatLng & { nonce: number; zoom?: number }) | null
  >(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const nonceRef = useRef(0);

  // Terugknop/Escape sluit overlays, zoals native modals dat doen.
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);
  const requestCloseSearch = useOverlayHistory('zoeken', searchOpen, closeSearch);
  const requestCloseFilter = useOverlayHistory('filters', filterOpen, closeFilter);

  const flyToCoord = useCallback((c: LatLng, zoom?: number) => {
    nonceRef.current += 1;
    setFlyTo({ ...c, nonce: nonceRef.current, zoom });
    setCenter(c);
  }, []);

  // Zet het beginmiddelpunt zodra locatie (of fallback) bekend is.
  useEffect(() => {
    if (center) return;
    if (status === 'granted' && location) {
      flyToCoord(location);
    } else if (status === 'denied' || status === 'unavailable') {
      setCenter(FALLBACK_CENTER);
    }
  }, [status, location, center, flyToCoord]);

  // Een via het zoekscherm gekozen plaats verplaatst de kaart (overzichtszoom).
  useEffect(() => {
    if (pendingCenter) {
      flyToCoord(
        {
          latitude: pendingCenter.latitude,
          longitude: pendingCenter.longitude,
        },
        INITIAL_ZOOM,
      );
      setPendingCenter(null);
    }
  }, [pendingCenter, flyToCoord, setPendingCenter]);

  const { observations, totalCount, isFetching, isError, refetch } =
    useObservations(center);
  const clusters = useClusters(observations, viewport);

  const openObservation = useCallback(
    (o: Observation) => navigate(`/waarneming/${o.id}`),
    [navigate],
  );

  const onClusterClick = useCallback(
    (point: ClusterPoint) => {
      // Vlieg naar het zoomniveau waarop dit cluster uiteenvalt.
      flyToCoord(
        { latitude: point.latitude, longitude: point.longitude },
        point.expansionZoom,
      );
    },
    [flyToCoord],
  );

  return (
    <div className="map-page">
      <LeafletMap
        initialCenter={FALLBACK_CENTER}
        center={center}
        radiusM={radiusM}
        clusters={clusters}
        userLocation={status === 'granted' ? location : null}
        flyTo={flyTo}
        onViewportChange={setViewport}
        onCenterSettled={setCenter}
        onClusterClick={onClusterClick}
        onObservationClick={(p) => p.observation && openObservation(p.observation)}
      />

      {/* Bovenlaag: zoekbalk + chips */}
      <div className="map-top">
        <button className="search-pill" onClick={() => setSearchOpen(true)}>
          <span aria-hidden>🔍</span>
          <span className={`search-pill-text${speciesFilter ? ' filled' : ''}`}>
            {speciesFilter ? speciesFilter.label : nl.map.search}
          </span>
          {speciesFilter ? (
            <span
              className="pill-clear"
              onClick={(e) => {
                e.stopPropagation();
                setSpeciesFilter(null);
              }}
              role="button"
              aria-label={nl.search.clearSpecies}
            >
              ✕
            </span>
          ) : null}
        </button>
        <SpeciesGroupChips />
      </div>

      {isFetching ? (
        <div className="status-pill">
          <span className="spinner spinner-sm" aria-hidden />
          {nl.map.loading}
        </div>
      ) : null}

      {/* FAB's */}
      <div className="fab-column">
        <button
          className="fab"
          aria-label={nl.map.myLocation}
          onClick={() => (location ? flyToCoord(location) : request())}
        >
          🎯
        </button>
        <button
          className="fab"
          aria-label={nl.filters.title}
          onClick={() => setFilterOpen(true)}
        >
          ⚙️
        </button>
      </div>

      <ObservationsList
        observations={observations}
        totalCount={totalCount}
        center={center}
        isError={isError}
        onRetry={refetch}
        onSelect={openObservation}
      />

      <FilterPanel open={filterOpen} onClose={requestCloseFilter} />
      {searchOpen ? <SearchOverlay onClose={requestCloseSearch} /> : null}
    </div>
  );
}
