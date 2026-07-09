import { useQuery } from '@tanstack/react-query';
import { getSpeciesGroups } from '../../api/species';
import { queryKeys } from '../../api/queryKeys';
import type { SpeciesGroup } from '../../api/types';

/** Haalt de soortgroepen op. Cachet lang (24 u) — de lijst wijzigt zelden. */
export function useSpeciesGroups() {
  return useQuery<SpeciesGroup[]>({
    queryKey: queryKeys.speciesGroups,
    queryFn: ({ signal }) => getSpeciesGroups({ signal }),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
