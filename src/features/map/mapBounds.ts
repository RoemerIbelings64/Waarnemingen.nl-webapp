import type { LatLngBoundsExpression } from 'leaflet';

/**
 * Grenzen van Nederland waarbinnen de kaart mag pannen/zoomen. Ruim genomen
 * voor de Waddeneilanden en Zeeland, krap genoeg tegen wegpannen naar het
 * buitenland. Gelijk aan de native app.
 */
export const NL_BOUNDS = {
  north: 53.7,
  east: 7.4,
  south: 50.6,
  west: 3.2,
} as const;

/** Leaflet-vorm van de grenzen: [[zuid, west], [noord, oost]]. */
export const NL_LEAFLET_BOUNDS: LatLngBoundsExpression = [
  [NL_BOUNDS.south, NL_BOUNDS.west],
  [NL_BOUNDS.north, NL_BOUNDS.east],
];

/** Fallback-middelpunt (Amsterdam) wanneer locatie niet beschikbaar is. */
export const FALLBACK_CENTER = { latitude: 52.3676, longitude: 4.9041 };

/**
 * Minimaal zoomniveau (Leaflet): verhindert uitzoomen voorbij heel Nederland.
 */
export const MIN_ZOOM = 7;
export const MAX_ZOOM = 18;
export const INITIAL_ZOOM = 11;

/** Bepaalt of een coördinaat binnen de Nederland-grenzen valt. */
export function isWithinBounds(coord: {
  latitude: number;
  longitude: number;
}): boolean {
  return (
    coord.latitude <= NL_BOUNDS.north &&
    coord.latitude >= NL_BOUNDS.south &&
    coord.longitude <= NL_BOUNDS.east &&
    coord.longitude >= NL_BOUNDS.west
  );
}

/** Klemt een coördinaat binnen de Nederland-grenzen. */
export function clampToBounds(coord: {
  latitude: number;
  longitude: number;
}): { latitude: number; longitude: number } {
  return {
    latitude: Math.min(NL_BOUNDS.north, Math.max(NL_BOUNDS.south, coord.latitude)),
    longitude: Math.min(NL_BOUNDS.east, Math.max(NL_BOUNDS.west, coord.longitude)),
  };
}
