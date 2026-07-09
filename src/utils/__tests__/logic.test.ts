import { describe, it, expect } from 'vitest';
import { distanceMeters, formatDistance, roundCoord } from '../geo';
import { dateBucket, formatRelative } from '../dates';
import { filterBySpeciesIds } from '../observations';
import { buildQuery } from '../../api/client';
import { parsePointLL } from '../../api/pdok';
import type { Observation } from '../../api/types';

const NOW = new Date(2026, 6, 8, 12, 0);

function obs(id: number, speciesId: number): Observation {
  return {
    id,
    permalink: '',
    date: '2026-07-08',
    time: '12:00',
    number: 1,
    sex: 'U',
    point: { type: 'Point', coordinates: [4.9, 52.3] },
    species_detail: {
      id: speciesId,
      scientific_name: 'X',
      name: 'Y',
      group: 1,
      type: 'S',
    },
  };
}

describe('geo', () => {
  it('formats distance with a Dutch comma', () => {
    expect(formatDistance(1400)).toBe('1,4 km');
    expect(formatDistance(120)).toBe('120 m');
  });
  it('rounds coordinates to a grid', () => {
    expect(roundCoord(52.37651)).toBe(52.38);
  });
  it('computes a plausible distance', () => {
    expect(distanceMeters(52.37, 4.9, 52.37, 4.9)).toBeCloseTo(0, 5);
  });
});

describe('dates', () => {
  it('buckets and labels relative dates', () => {
    expect(dateBucket('2026-07-08', NOW)).toBe('today');
    expect(formatRelative('2026-07-07', null, NOW)).toBe('Gisteren');
  });
});

describe('species filter', () => {
  it('keeps only matching species ids', () => {
    const list = [obs(1, 33), obs(2, 698), obs(3, 33)];
    expect(filterBySpeciesIds(list, new Set([33])).map((o) => o.id)).toEqual([
      1, 3,
    ]);
  });
});

describe('api helpers', () => {
  it('builds querystrings and encodes commas', () => {
    expect(buildQuery({ coordinates: '52.41,4.57', days: 7 })).toBe(
      '?coordinates=52.41%2C4.57&days=7',
    );
  });
  it('parses a PDOK WKT point', () => {
    const p = parsePointLL('POINT(4.8706159 52.35939489)');
    expect(p?.latitude).toBeCloseTo(52.35939489);
  });
});
