import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy naar de waarneming.nl API.
 *
 * De browser kan waarneming.nl niet direct aanroepen: die API stuurt geen
 * CORS-headers. Deze Vercel-functie haalt de data server-side op (geen
 * CORS-restrictie) en geeft ze door aan de PWA. Alleen GET wordt doorgelaten.
 */
const UPSTREAM = 'https://waarneming.nl/api/v1';
const USER_AGENT = 'NatuurkaartPWA/1.0 (+https://waarneming.nl)';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Alleen GET toegestaan' });
    return;
  }

  // Reconstrueer het pad achter /api/waarneming/.
  const pathParam = req.query.path;
  const segments = Array.isArray(pathParam) ? pathParam : [pathParam ?? ''];
  const path = segments.join('/');

  // Neem de originele querystring over (behalve de interne `path`-parameter).
  const url = new URL(req.url ?? '', 'http://localhost');
  url.searchParams.delete('path');
  const qs = url.searchParams.toString();
  const target = `${UPSTREAM}/${path}${qs ? `?${qs}` : ''}`;

  const language =
    (req.headers['accept-language'] as string | undefined) ?? 'nl';

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': language,
        'User-Agent': USER_AGENT,
      },
    });

    const body = await upstream.text();
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') ?? 'application/json',
    );
    // Korte edge-cache; waarnemingsdata is een paar minuten houdbaar.
    res.setHeader(
      'Cache-Control',
      's-maxage=120, stale-while-revalidate=600',
    );
    res.status(upstream.status).send(body);
  } catch {
    res.status(502).json({ error: 'Upstream niet bereikbaar' });
  }
}
