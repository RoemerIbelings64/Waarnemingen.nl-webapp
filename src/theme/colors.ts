/**
 * Kleur per soortgroep-id (waarneming.nl species-group ids). Gebruikt voor
 * markers en accenten. Identiek aan de native app zodat het ontwerp klopt.
 */
export const speciesGroupColors: Record<number, string> = {
  1: '#2D6A4F', // Vogels
  2: '#9C6644', // Zoogdieren
  3: '#40916C', // Reptielen en amfibieën
  4: '#E76F51', // Dagvlinders
  5: '#3A86FF', // Libellen
  6: '#8338EC', // Insecten (overig)
  7: '#0E7C7B', // Weekdieren
  8: '#B5838D', // Nachtvlinders
  9: '#457B9D', // Vissen
  10: '#588157', // Planten
  11: '#BC6C25', // Paddenstoelen
  12: '#6B9080', // Mossen en korstmossen
  13: '#7D8597', // Geleedpotigen (overig)
  14: '#A3B18A', // Sprinkhanen
  15: '#9D4EDD', // Wantsen
  16: '#5F0F40', // Kevers
  17: '#F4A261', // Bijen en wespen
  18: '#6D6875', // Vliegen en muggen
  19: '#2A9D8F', // Algen
  20: '#8D99AE', // Overige ongewervelden
  30: '#B23A48', // Verstoringen
};

export const DEFAULT_GROUP_COLOR = '#6C757D';

export function colorForGroup(groupId: number | null | undefined): string {
  if (groupId == null) return DEFAULT_GROUP_COLOR;
  return speciesGroupColors[groupId] ?? DEFAULT_GROUP_COLOR;
}

/** Emoji per soortgroep voor de chips (parallel aan de native app). */
export const GROUP_EMOJI: Record<number, string> = {
  1: '🐦',
  2: '🦊',
  3: '🐸',
  4: '🦋',
  5: '🪰',
  6: '🐛',
  7: '🐚',
  8: '🦋',
  9: '🐟',
  10: '🌱',
  11: '🍄',
  12: '🌿',
  13: '🕷️',
  14: '🦗',
  15: '🐞',
  16: '🪲',
  17: '🐝',
  18: '🦟',
  19: '🦠',
  20: '🪱',
  30: '⚠️',
};
