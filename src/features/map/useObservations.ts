import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getObservationsAroundPoint } from '../../api/observations';
import { queryKeys } from '../../api/queryKeys';
import type { Observation } from '../../api/types';
import { daysForPeriod, useFilterStore } from '../filters/filterStore';
import { filterBySpeciesIds, obsLat, obsLng } from '../../utils/observations';
import { distanceMeters } from '../../utils/geo';

/** Bovengrens op het aantal opgehaalde waarnemingen (netheid t.o.v. de API). */
const FETCH_LIMIT = 200;

export interface ObservationsResult {
  observations: Observation[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Haalt waarnemingen op rond een middelpunt en past de actieve filters toe.
 * De soortgroep gaat server-side mee; de soort-/familiefilter uit het
 * zoekscherm wordt client-side toegepast (around-point kent geen soortparameter).
 */
export function useObservations(
  center: { latitude: number; longitude: number } | null,
): ObservationsResult {
  const period = useFilterStore((s) => s.period);
  const radius = useFilterStore((s) => s.radius);
  const speciesGroup = useFilterStore((s) => s.speciesGroup);
  const speciesFilter = useFilterStore((s) => s.speciesFilter);
  const days = daysForPeriod(period);

  const query = useQuery({
    queryKey: center
      ? queryKeys.aroundPoint({
          latitude: center.latitude,
          longitude: center.longitude,
          days,
          radius,
          speciesGroup,
        })
      : ['around-point', 'disabled'],
    enabled: center != null,
    queryFn: ({ signal }) =>
      getObservationsAroundPoint(
        {
          latitude: center!.latitude,
          longitude: center!.longitude,
          days,
          radius,
          speciesGroup: speciesGroup ?? undefined,
          limit: FETCH_LIMIT,
        },
        { signal },
      ),
  });

  const observations = useMemo(() => {
    const raw = query.data?.results ?? [];
    const speciesIds = speciesFilter ? new Set(speciesFilter.speciesIds) : null;
    const filtered = filterBySpeciesIds(raw, speciesIds).filter(
      (o) => o.point?.coordinates?.length === 2,
    );
    if (!center) return filtered;
    return [...filtered].sort(
      (a, b) =>
        distanceMeters(center.latitude, center.longitude, obsLat(a), obsLng(a)) -
        distanceMeters(center.latitude, center.longitude, obsLat(b), obsLng(b)),
    );
  }, [query.data, speciesFilter, center]);

  return {
    observations,
    totalCount: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
