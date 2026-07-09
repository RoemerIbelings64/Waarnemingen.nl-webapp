import { create } from 'zustand';

/**
 * Deelt een via het zoekscherm gekozen middelpunt met de kaart. De kaart leest
 * `pendingCenter`, verplaatst zichzelf en wist het.
 */
interface MapCenterState {
  pendingCenter: { latitude: number; longitude: number; label?: string } | null;
  setPendingCenter: (
    center: { latitude: number; longitude: number; label?: string } | null,
  ) => void;
}

export const useMapCenterStore = create<MapCenterState>((set) => ({
  pendingCenter: null,
  setPendingCenter: (center) => set({ pendingCenter: center }),
}));
