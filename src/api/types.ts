/**
 * Typen voor de publieke waarneming.nl / observation.org API (v1).
 * Afgeleid van de daadwerkelijke API-responses. De API kan extra velden
 * toevoegen; consumenten moeten onbekende velden tolereren.
 */

/** GeoJSON-punt: coordinates = [longitude, latitude]. */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

/** Ingebedde soortsamenvatting op een waarneming. */
export interface SpeciesDetail {
  id: number;
  scientific_name: string;
  /** Nederlandse naam (bij Accept-Language: nl). */
  name: string;
  /** Soortgroep-id. */
  group: number;
  type: string;
}

/** Ingebedde locatiesamenvatting op een waarneming. */
export interface LocationDetail {
  id: number;
  name: string;
  country_code: string;
  permalink: string;
}

/** Eén waarneming zoals geleverd door het around-point-endpoint. */
export interface Observation {
  id: number;
  permalink: string;
  /** Datum ISO `yyyy-mm-dd`. */
  date: string;
  /** Tijd `hh:mm` of null. */
  time: string | null;
  species_detail: SpeciesDetail | null;
  number: number;
  sex: string;
  point: GeoPoint;
  location_detail?: LocationDetail | null;
  /** Zeldzaamheidscode 0–5 (hoger = zeldzamer). */
  rarity?: number;
  has_photo?: boolean;
  has_sound?: boolean;
  is_certain?: boolean;
  is_escape?: boolean;
  validation_status?: string;
  user?: number;
  /** Foto-URL's (aanwezig op detail-endpoints). */
  photos?: string[];
  sounds?: string[];
}

/** Soort zoals geleverd door species/search en species/{id}. */
export interface Species {
  id: number;
  scientific_name: string;
  authority?: string;
  name: string;
  group: number;
  group_name?: string;
  status?: string;
  rarity?: string;
  type: string;
  photo?: string | null;
  permalink: string;
  info_text?: string;
}

/** Soortgroep uit species-groups/. */
export interface SpeciesGroup {
  id: number;
  name: string;
}

/** Eén content-item binnen een informatieblok (block-based structuur). */
export interface InformationContent {
  type: string;
  /** Aanwezig op `html`-content: HTML-tekst met de beschrijving. */
  body?: string;
  /** Aanwezig op `item-list`/`table`/etc. */
  items?: Record<string, unknown>[];
  [key: string]: unknown;
}

/** Informatieblok uit species/{id}/information/. */
export interface InformationBlock {
  title?: string | null;
  content: InformationContent[];
}

/** Respons van species/{id}/information/. */
export interface SpeciesInformationResponse {
  id: number;
  information: InformationBlock[];
}

/** Standaard gepagineerd resultaat (DRF-stijl). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
