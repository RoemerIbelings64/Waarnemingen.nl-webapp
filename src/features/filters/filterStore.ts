import { create } from 'zustand';
import { MAX_RADIUS_M } from '../../api/observations';

/** Voorgedefinieerde periodes (dagen terug). */
export type PeriodKey = 'today' | 'd3' | 'd7' | 'd30';

export const PERIOD_DAYS: Record<PeriodKey, number> = {
  today: 1,
  d3: 3,
  d7: 7,
  d30: 30,
};

/** Actieve soortfilter (gekozen via het zoekscherm). */
export interface SpeciesFilter {
  label: string;
  speciesIds: number[];
}

interface FilterState {
  speciesGroup: number | null;
  period: PeriodKey;
  radius: number;
  speciesFilter: SpeciesFilter | null;

  setSpeciesGroup: (id: number | null) => void;
  setPeriod: (period: PeriodKey) => void;
  setRadius: (meters: number) => void;
  setSpeciesFilter: (filter: SpeciesFilter | null) => void;
  reset: () => void;
}

const DEFAULTS = {
  speciesGroup: null as number | null,
  period: 'd7' as PeriodKey,
  radius: 5000,
  speciesFilter: null as SpeciesFilter | null,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULTS,
  setSpeciesGroup: (id) => set({ speciesGroup: id }),
  setPeriod: (period) => set({ period }),
  setRadius: (meters) =>
    set({ radius: Math.max(1000, Math.min(meters, MAX_RADIUS_M)) }),
  setSpeciesFilter: (filter) => set({ speciesFilter: filter }),
  reset: () => set({ ...DEFAULTS }),
}));

/** Aantal dagen dat bij de huidige periode hoort. */
export function daysForPeriod(period: PeriodKey): number {
  return PERIOD_DAYS[period];
}
