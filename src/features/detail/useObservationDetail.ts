import { useQuery } from '@tanstack/react-query';
import { getObservation } from '../../api/observations';
import { getSpeciesInformation } from '../../api/species';
import { queryKeys } from '../../api/queryKeys';
import type { Observation, SpeciesInformationResponse } from '../../api/types';

/** Haalt de volledige waarneming op (inclusief foto-URL's). */
export function useObservationDetail(id: number) {
  return useQuery<Observation>({
    queryKey: queryKeys.observation(id),
    queryFn: ({ signal }) => getObservation(id, { signal }),
  });
}

/** Haalt soortinformatie op; alleen ingeschakeld wanneer de soort-id bekend is. */
export function useSpeciesInformation(speciesId: number | undefined) {
  return useQuery<SpeciesInformationResponse>({
    queryKey: queryKeys.speciesInformation(speciesId ?? -1),
    enabled: speciesId != null,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: ({ signal }) => getSpeciesInformation(speciesId!, { signal }),
  });
}

/**
 * Pelt de leesbare beschrijving uit de block-based informatiestructuur.
 * Zoekt het eerste `html`-content-blok en str't de HTML tot platte tekst.
 */
export function extractDescription(
  info: SpeciesInformationResponse | undefined,
): string | null {
  if (!info) return null;
  for (const block of info.information) {
    for (const content of block.content) {
      if (content.type === 'html' && typeof content.body === 'string') {
        return stripHtml(content.body);
      }
    }
  }
  return null;
}

/** Verwijdert HTML-tags en normaliseert witruimte voor weergave. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|h\d|li|div)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
