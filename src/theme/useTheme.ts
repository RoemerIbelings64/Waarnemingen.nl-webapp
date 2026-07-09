import { useSyncExternalStore } from 'react';

/**
 * Volgt de donkere/lichte systeemvoorkeur. Gebruikt voor keuzes die niet via
 * CSS gaan (kaarttegels, cirkelvulling op de kaart).
 */
function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
