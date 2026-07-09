import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/**
 * Kiest de index van het dichtstbijzijnde snappunt (in px).
 * Exporteerbaar voor unit tests.
 */
export function nearestSnapIndex(heightPx: number, snapsPx: number[]): number {
  let best = 0;
  for (let i = 1; i < snapsPx.length; i++) {
    if (Math.abs(snapsPx[i] - heightPx) < Math.abs(snapsPx[best] - heightPx)) {
      best = i;
    }
  }
  return best;
}

export interface DragSheetHandleProps {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

interface DragSheetOptions {
  /** Snappunten als fractie van de viewporthoogte, oplopend (bv. [0.14, 0.55, 0.92]). */
  snapFractions: number[];
  initialIndex?: number;
  /** Zet op false om het slepen uit te schakelen (bv. desktop-layout). */
  enabled?: boolean;
  /** Aangeroepen wanneer de sheet onder het laagste snappunt wordt losgelaten. */
  onDismiss?: () => void;
}

/**
 * Sleepbare bottom sheet met snappunten, zoals de native app (@gorhom).
 * Koppel `handleProps` aan het sleep-handvat; zet `heightPx` als hoogte op
 * het sheet-element (met transition uit tijdens `dragging`).
 */
export function useDragSheet({
  snapFractions,
  initialIndex = 0,
  enabled = true,
  onDismiss,
}: DragSheetOptions) {
  const [heightPx, setHeightPx] = useState<number | null>(() =>
    typeof window === 'undefined'
      ? null
      : snapFractions[initialIndex] * window.innerHeight,
  );
  const [dragging, setDragging] = useState(false);
  const heightRef = useRef(heightPx);
  const snapIndexRef = useRef(initialIndex);
  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const applyHeight = useCallback((h: number) => {
    heightRef.current = h;
    setHeightPx(h);
  }, []);

  // Houd de hoogte in lijn met het actieve snappunt bij (her)activeren en resize.
  useEffect(() => {
    if (!enabled) return;
    const sync = () =>
      applyHeight(snapFractions[snapIndexRef.current] * window.innerHeight);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [enabled, snapFractions, applyHeight]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStart.current = {
        y: e.clientY,
        height:
          heightRef.current ??
          snapFractions[snapIndexRef.current] * window.innerHeight,
      };
      setDragging(true);
    },
    [enabled, snapFractions],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const start = dragStart.current;
      if (!start) return;
      const max = snapFractions[snapFractions.length - 1] * window.innerHeight;
      const next = Math.min(max, Math.max(0, start.height + (start.y - e.clientY)));
      applyHeight(next);
    },
    [snapFractions, applyHeight],
  );

  const endDrag = useCallback(() => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setDragging(false);
    const h = heightRef.current ?? 0;
    const snaps = snapFractions.map((f) => f * window.innerHeight);
    // Onder driekwart van het laagste snappunt losgelaten = sluiten (indien mogelijk).
    if (dismissRef.current && h < snaps[0] * 0.75) {
      dismissRef.current();
      return;
    }
    const idx = nearestSnapIndex(h, snaps);
    snapIndexRef.current = idx;
    applyHeight(snaps[idx]);
  }, [snapFractions, applyHeight]);

  const handleProps: DragSheetHandleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return { heightPx, dragging, handleProps };
}
