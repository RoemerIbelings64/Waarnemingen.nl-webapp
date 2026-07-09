import { apiGet, type RequestOptions } from './client';
import type {
  Observation,
  Paginated,
  Species,
  SpeciesGroup,
  SpeciesInformationResponse,
} from './types';

export interface SpeciesSearchParams {
  /** Zoekterm (soort, familie, wetenschappelijke naam). */
  q: string;
  speciesGroup?: number;
  limit?: number;
  offset?: number;
}

/**
 * Zoekt soorten op naam/familie.
 * Publiek endpoint: `GET /species/search/`.
 */
export function searchSpecies(
  params: SpeciesSearchParams,
  options: RequestOptions = {},
): Promise<Paginated<Species>> {
  return apiGet<Paginated<Species>>('species/search/', {
    ...options,
    params: {
      q: params.q,
      species_group: params.speciesGroup,
      limit: params.limit ?? 20,
      offset: params.offset,
    },
  });
}

/**
 * Haalt de lijst met soortgroepen op (Vogels, Planten, …).
 * Publiek endpoint: `GET /species-groups/`.
 */
export function getSpeciesGroups(
  options: RequestOptions = {},
): Promise<SpeciesGroup[]> {
  return apiGet<SpeciesGroup[]>('species-groups/', options);
}

/**
 * Haalt uitgebreide soortinformatie op (beschrijving, herkenning, …).
 * Publiek endpoint: `GET /species/{id}/information/`.
 */
export function getSpeciesInformation(
  id: number,
  options: RequestOptions = {},
): Promise<SpeciesInformationResponse> {
  return apiGet<SpeciesInformationResponse>(
    `species/${id}/information/`,
    options,
  );
}

/**
 * Haalt waarnemingen van één soort op.
 * Publiek endpoint: `GET /species/{id}/observations/`.
 */
export function getSpeciesObservations(
  id: number,
  options: RequestOptions = {},
): Promise<Paginated<Observation>> {
  return apiGet<Paginated<Observation>>(`species/${id}/observations/`, options);
}
