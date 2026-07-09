/**
 * PDOK Locatieserver — gratis Nederlandse overheids-geocoder (geen API-key).
 * Gebruikt voor het zoeken van plaatsen, straten en gebieden in Nederland.
 */
import { NetworkError } from './client';

const PDOK_BASE =
  'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

export interface PdokSuggestion {
  id: string;
  /** Weergavenaam, bv. "Vondelpark, Amsterdam". */
  label: string;
  /** Type: adres, weg, woonplaats, gemeente, … */
  type: string;
}

export interface PdokLocation {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

interface PdokDoc {
  id: string;
  weergavenaam: string;
  type: string;
  centroide_ll?: string;
}

interface PdokResponse {
  response: { docs: PdokDoc[] };
}

async function pdokFetch(url: string, signal?: AbortSignal): Promise<PdokResponse> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new NetworkError((err as Error)?.message);
  }
  if (!res.ok) throw new NetworkError(`PDOK-fout ${res.status}`);
  return (await res.json()) as PdokResponse;
}

/**
 * Suggesties voor een zoekterm. Beperkt tot Nederlandse locaties.
 */
export async function suggestLocations(
  query: string,
  signal?: AbortSignal,
): Promise<PdokSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const url = `${PDOK_BASE}/suggest?q=${encodeURIComponent(trimmed)}&rows=6&fq=type:(woonplaats+OR+gemeente+OR+weg+OR+adres)`;
  const data = await pdokFetch(url, signal);
  return data.response.docs.map((d) => ({
    id: d.id,
    label: d.weergavenaam,
    type: d.type,
  }));
}

/**
 * Parseert een PDOK WKT-punt `POINT(lng lat)` naar coördinaten.
 * Exporteerbaar voor unit tests.
 */
export function parsePointLL(
  wkt: string | undefined,
): { latitude: number; longitude: number } | null {
  if (!wkt) return null;
  const match = wkt.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;
  const longitude = Number(match[1]);
  const latitude = Number(match[2]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return { latitude, longitude };
}

/**
 * Zoekt de coördinaten van een gekozen suggestie op.
 */
export async function lookupLocation(
  id: string,
  signal?: AbortSignal,
): Promise<PdokLocation | null> {
  const url = `${PDOK_BASE}/lookup?id=${encodeURIComponent(id)}&fl=id,weergavenaam,centroide_ll`;
  const data = await pdokFetch(url, signal);
  const doc = data.response.docs[0];
  if (!doc) return null;
  const coords = parsePointLL(doc.centroide_ll);
  if (!coords) return null;
  return { id: doc.id, label: doc.weergavenaam, ...coords };
}
