/** Datumhulpfuncties met Nederlandse labels. */

import { nl } from '../i18n/nl';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Aantal hele dagen tussen twee datums (op kalenderdag-basis, lokale tijd). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

export type DateBucket = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

/**
 * Deelt een waarnemingsdatum in bij een groep voor de lijstweergave.
 * @param isoDate ISO `yyyy-mm-dd`
 * @param now referentiedatum (default nu) — injecteerbaar voor tests
 */
export function dateBucket(isoDate: string, now: Date = new Date()): DateBucket {
  const date = parseISODate(isoDate);
  if (!date) return 'earlier';
  const diff = daysBetween(date, now);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return 'thisWeek';
  return 'earlier';
}

export function bucketLabel(bucket: DateBucket): string {
  switch (bucket) {
    case 'today':
      return nl.list.today;
    case 'yesterday':
      return nl.list.yesterday;
    case 'thisWeek':
      return nl.list.thisWeek;
    default:
      return nl.list.earlier;
  }
}

/** Parseert `yyyy-mm-dd` naar een lokale Date, of null. */
export function parseISODate(isoDate: string): Date | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

const MONTHS_NL = [
  'jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.',
  'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.',
];

/**
 * Nette datumweergave: "8 jul. 2026". Optioneel met tijd: "8 jul. 2026, 20:23".
 */
export function formatDate(isoDate: string, time?: string | null): string {
  const date = parseISODate(isoDate);
  if (!date) return isoDate;
  const base = `${date.getDate()} ${MONTHS_NL[date.getMonth()]} ${date.getFullYear()}`;
  return time ? `${base}, ${time}` : base;
}

/**
 * Korte relatieve tijd voor lijstrijen: "Vandaag 20:23", "Gisteren", "8 jul.".
 */
export function formatRelative(
  isoDate: string,
  time: string | null,
  now: Date = new Date(),
): string {
  const bucket = dateBucket(isoDate, now);
  const date = parseISODate(isoDate);
  const timePart = time ? ` ${time}` : '';
  if (bucket === 'today') return `${nl.list.today}${timePart}`;
  if (bucket === 'yesterday') return `${nl.list.yesterday}${timePart}`;
  if (!date) return isoDate;
  return `${date.getDate()} ${MONTHS_NL[date.getMonth()]}${timePart}`;
}
