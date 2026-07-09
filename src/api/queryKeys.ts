/** Centrale query-keys zodat caching en invalidatie consistent blijven. */

import { roundCoord } from '../utils/geo';

export const queryKeys = {
  speciesGroups: ['species-groups'] as const,

  /**
   * Around-point-key met afgeronde coördinaten, zodat kleine
   * kaartverschuivingen dezelfde cache-entry hergebruiken.
   */
  aroundPoint: (args: {
    latitude: number;
    longitude: number;
    days: number;
    radius: number;
    speciesGroup?: number | null;
  }) =>
    [
      'around-point',
      roundCoord(args.latitude),
      roundCoord(args.longitude),
      args.days,
      args.radius,
      args.speciesGroup ?? null,
    ] as const,

  speciesSearch: (q: string) => ['species-search', q.trim().toLowerCase()] as const,

  speciesInformation: (id: number) => ['species-info', id] as const,

  observation: (id: number) => ['observation', id] as const,

  pdokSuggest: (q: string) => ['pdok-suggest', q.trim().toLowerCase()] as const,
} as const;
