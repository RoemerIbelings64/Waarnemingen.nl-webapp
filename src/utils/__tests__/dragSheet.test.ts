import { describe, it, expect } from 'vitest';
import { nearestSnapIndex } from '../useDragSheet';

describe('nearestSnapIndex', () => {
  const snaps = [140, 550, 920]; // px-varianten van 14/55/92% bij 1000px viewport

  it('kiest het dichtstbijzijnde snappunt', () => {
    expect(nearestSnapIndex(100, snaps)).toBe(0);
    expect(nearestSnapIndex(400, snaps)).toBe(1);
    expect(nearestSnapIndex(600, snaps)).toBe(1);
    expect(nearestSnapIndex(800, snaps)).toBe(2);
    expect(nearestSnapIndex(2000, snaps)).toBe(2);
  });

  it('kiest bij exact midden het laagste punt (stabiel gedrag)', () => {
    expect(nearestSnapIndex(345, snaps)).toBe(0);
  });

  it('werkt met één snappunt (filterpaneel)', () => {
    expect(nearestSnapIndex(999, [800])).toBe(0);
    expect(nearestSnapIndex(1, [800])).toBe(0);
  });
});
