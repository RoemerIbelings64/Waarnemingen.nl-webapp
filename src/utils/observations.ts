/** Hulpfuncties voor het filteren en ordenen van waarnemingen. */

import type { Observation } from '../api/types';

/**
 * Filtert waarnemingen op een set soort-id's. Wordt gebruikt om een
 * soort-/familiezoekopdracht toe te passen op de around-point-resultaten
 * (dat endpoint kent zelf geen soortparameter).
 *
 * @param speciesIds set toegestane soort-id's; leeg/undefined = geen filter
 */
export function filterBySpeciesIds(
  observations: Observation[],
  speciesIds: Set<number> | null | undefined,
): Observation[] {
  if (!speciesIds || speciesIds.size === 0) return observations;
  return observations.filter(
    (o) => o.species_detail != null && speciesIds.has(o.species_detail.id),
  );
}

/**
 * Filtert op soortgroep (client-side vangnet naast de API-parameter).
 */
export function filterByGroup(
  observations: Observation[],
  groupId: number | null | undefined,
): Observation[] {
  if (groupId == null) return observations;
  return observations.filter((o) => o.species_detail?.group === groupId);
}

/**
 * Sorteert waarnemingen op afstand tot een referentiepunt (oplopend).
 * Verwacht dat elke waarneming een geldig punt heeft.
 */
export function sortByDistance(
  observations: Observation[],
  distanceOf: (o: Observation) => number,
): Observation[] {
  return [...observations].sort((a, b) => distanceOf(a) - distanceOf(b));
}

/** Latitude van een waarneming (GeoJSON = [lng, lat]). */
export function obsLat(o: Observation): number {
  return o.point.coordinates[1];
}

/** Longitude van een waarneming. */
export function obsLng(o: Observation): number {
  return o.point.coordinates[0];
}
