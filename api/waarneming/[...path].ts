import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy naar de waarneming.nl API.
 *
 * De browser kan waarneming.nl niet direct aanroepen: die API stuurt geen
 * CORS-headers. Deze Vercel-functie haalt de data server-side op (geen
 * CORS-restrictie) en geeft ze door aan de PWA. Alleen GET wordt doorgelaten.
 *
 * We leiden het upstream-pad af uit de originele pathname (niet uit de losse
 * `[...path]`-segmenten), zodat de **trailing slash behouden blijft**. Alle
 * waarneming.nl v1-endpoints eindigen op `/`; zonder die slash antwoordt de
 * API met een 301-redirect. Zo gedraagt de proxy zich identiek aan de Vite
 * dev-proxy.
 */
const UPSTREAM = 'https://waarneming.nl/api/v1';
const PREFIX = '/api/waarneming';

// Realistische browser-User-Agent: waarneming.nl staat achter Cloudflare, dat
// datacenter-IP's met een bot-achtige UA kan blokkeren. Een echte browser-UA
// verkleint die kans (de browser mag deze header zelf niet zetten).
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Alleen GET toegestaan' });
    return;
  }

  // Splits pad en query uit de originele URL; behoud de exacte pathname
  // (inclusief trailing slash).
  const parsed = new URL(req.url ?? '', 'http://localhost');
  let path = parsed.pathname;
  if (path.startsWith(PREFIX)) path = path.slice(PREFIX.length);
  if (!path.startsWith('/')) path = `/${path}`;
  const target = `${UPSTREAM}${path}${parsed.search}`;

  const language =
    (req.headers['accept-language'] as string | undefined) ?? 'nl';

  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': language,
        'User-Agent': USER_AGENT,
        Referer: 'https://waarneming.nl/',
      },
    });

    const body = await upstream.text();
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') ?? 'application/json',
    );
    if (upstream.ok) {
      // Korte edge-cache; waarnemingsdata is een paar minuten houdbaar.
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    } else {
      // Maak een upstream-fout zichtbaar in de Vercel-logs voor diagnose.
      console.error(`Upstream ${upstream.status} voor ${target}`);
    }
    res.status(upstream.status).send(body);
  } catch (err) {
    console.error('Proxy-fout:', (err as Error)?.message, 'voor', target);
    res.status(502).json({ error: 'Upstream niet bereikbaar' });
  }
}
