import { useQuery } from '@tanstack/react-query';
import { searchSpecies } from '../../api/species';
import { suggestLocations, type PdokSuggestion } from '../../api/pdok';
import { queryKeys } from '../../api/queryKeys';
import type { Species } from '../../api/types';

/** Zoekt soorten op naam/familie (via de proxy). */
export function useSpeciesSearch(query: string) {
  const trimmed = query.trim();
  return useQuery<Species[]>({
    queryKey: queryKeys.speciesSearch(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const res = await searchSpecies({ q: trimmed, limit: 15 }, { signal });
      return res.results;
    },
  });
}

/** Zoekt Nederlandse plaatsen via PDOK (directe CORS-aanroep). */
export function useLocationSearch(query: string) {
  const trimmed = query.trim();
  return useQuery<PdokSuggestion[]>({
    queryKey: queryKeys.pdokSuggest(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 60 * 60 * 1000,
    queryFn: ({ signal }) => suggestLocations(trimmed, signal),
  });
}
