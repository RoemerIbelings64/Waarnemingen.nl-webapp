/**
 * Dunne fetch-wrapper voor de waarneming.nl API, via de eigen proxy.
 *
 * De browser kan waarneming.nl niet direct aanroepen (geen CORS-header), dus
 * alle verzoeken lopen via `/api/waarneming/...` — lokaal afgehandeld door de
 * Vite dev-proxy, in productie door een Vercel serverless-functie. Beide zetten
 * server-side de juiste headers (o.a. User-Agent, die de browser niet mag zetten).
 */

/** Same-origin proxy-pad; wordt server-side doorgestuurd naar waarneming.nl. */
export const API_BASE_URL = '/api/waarneming';

/** Basisfout voor alle API-fouten. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Specifiek voor HTTP 429 — TanStack Query mag hierop backoff-retryen. */
export class RateLimitError extends ApiError {
  constructor(body?: unknown) {
    super('Rate limit bereikt', 429, body);
    this.name = 'RateLimitError';
  }
}

/** Netwerkfout (geen respons ontvangen). */
export class NetworkError extends Error {
  constructor(message = 'Netwerkfout') {
    super(message);
    this.name = 'NetworkError';
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

/**
 * Bouwt een querystring. Arrays worden herhaald (`?id=1&id=2`), wat de API
 * verwacht voor herhaalbare parameters. `null`/`undefined` worden overgeslagen.
 */
export function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      if (v == null) continue;
      const serialized = typeof v === 'boolean' ? (v ? '1' : '0') : String(v);
      search.append(key, serialized);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export interface RequestOptions {
  params?: QueryParams;
  /** Taal voor Accept-Language (default 'nl'). */
  language?: string;
  signal?: AbortSignal;
}

/**
 * Voert een GET-verzoek uit tegen een publiek API-endpoint via de proxy.
 *
 * @param path endpointpad zonder leidende slash, bv. `observations/around-point/`
 */
export async function apiGet<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, language = 'nl', signal } = options;
  const url = `${API_BASE_URL}/${path}${buildQuery(params)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': language,
      },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new NetworkError((err as Error)?.message);
  }

  if (!response.ok) {
    const body = await readBody(response);
    if (response.status === 429) throw new RateLimitError(body);
    throw new ApiError(
      `API-verzoek mislukte met status ${response.status}`,
      response.status,
      body,
    );
  }

  return (await response.json()) as T;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
