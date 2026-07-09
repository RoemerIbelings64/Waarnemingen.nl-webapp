import { apiGet, type RequestOptions } from './client';
import type { Observation, Paginated } from './types';

/** Maximale zoekstraal die de API toestaat (meters). */
export const MAX_RADIUS_M = 10000;

export interface AroundPointParams {
  /** Middelpunt. */
  latitude: number;
  longitude: number;
  /** Aantal dagen terug vanaf `endDate` (verplicht door de API). */
  days: number;
  /** Zoekstraal in meters (default 5000, max 10000). */
  radius?: number;
  /** Alleen deze soortgroep. */
  speciesGroup?: number;
  /** ISO `yyyy-mm-dd`, standaard vandaag. */
  endDate?: string;
  /** Minimale zeldzaamheid. */
  minRarity?: number;
  limit?: number;
  offset?: number;
}

/**
 * Haalt waarnemingen op rond een geografisch punt.
 * Publiek endpoint: `GET /observations/around-point/`.
 */
export function getObservationsAroundPoint(
  params: AroundPointParams,
  options: RequestOptions = {},
): Promise<Paginated<Observation>> {
  const radius = Math.min(params.radius ?? 5000, MAX_RADIUS_M);
  return apiGet<Paginated<Observation>>('observations/around-point/', {
    ...options,
    params: {
      coordinates: `${params.latitude},${params.longitude}`,
      days: params.days,
      radius,
      species_group: params.speciesGroup,
      end_date: params.endDate,
      min_rarity: params.minRarity,
      limit: params.limit ?? 100,
      offset: params.offset,
    },
  });
}

/**
 * Haalt een enkele waarneming op.
 * Publiek endpoint: `GET /observations/{id}/`.
 */
export function getObservation(
  id: number,
  options: RequestOptions = {},
): Promise<Observation> {
  return apiGet<Observation>(`observations/${id}/`, options);
}
