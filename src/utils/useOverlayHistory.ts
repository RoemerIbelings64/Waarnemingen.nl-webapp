import { useCallback, useEffect } from 'react';

interface OverlayHistoryState {
  nkOverlay?: string;
  [key: string]: unknown;
}

function currentOverlay(): string | undefined {
  return (window.history.state as OverlayHistoryState | null)?.nkOverlay;
}

/**
 * Koppelt een overlay (zoekscherm, filterpaneel) aan de browsergeschiedenis,
 * zoals native modals aan de terugknop hangen: openen pusht een history-entry,
 * de terugknop (of Escape) sluit de overlay in plaats van de pagina te verlaten.
 *
 * Gebruik de teruggegeven `requestClose` voor alle sluit-acties in de UI, zodat
 * de history-entry netjes wordt opgeruimd.
 */
export function useOverlayHistory(
  id: string,
  open: boolean,
  onClose: () => void,
): () => void {
  const requestClose = useCallback(() => {
    if (currentOverlay() === id) {
      // popstate roept onClose aan; zo blijft de history consistent.
      window.history.back();
    } else {
      onClose();
    }
  }, [id, onClose]);

  useEffect(() => {
    if (!open) return;
    // Bewaar de bestaande (router-)state zodat terugnavigeren consistent blijft.
    if (currentOverlay() !== id) {
      window.history.pushState(
        { ...(window.history.state as object | null), nkOverlay: id },
        '',
      );
    }
    const onPop = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, id, onClose, requestClose]);

  return requestClose;
}
