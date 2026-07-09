# Natuurkaart — PWA

Progressive Web App (React + TypeScript + Vite) for browsing recent Dutch nature observations on an interactive map, in the browser and installable on your device. Same functionality and design as the native app, data from [waarneming.nl](https://waarneming.nl).

Built with Claude Fable 5.

## Features

- Interactive map (Leaflet) with clustered observation markers.
- Constrained to **the Netherlands** — cannot pan or zoom outside its borders.
- The **search radius** shown as a circle on the map around the current center.
- Search by species/family and by Dutch place name (PDOK).
- Filters: species group, period, search radius.
- List grouped by Today / Yesterday / This week; detail screen with photos.
- Dark mode (follows system), fully Dutch interface.
- Installable (PWA): manifest + service worker, map tiles cached offline.

## Tech Stack

| Component | Choice |
|---|---|
| Build | Vite + React 19 + TypeScript |
| Map | Leaflet + react-leaflet, CARTO basemaps (no API key) |
| Clustering | supercluster |
| Server state | TanStack Query |
| UI state | Zustand |
| Routing | react-router-dom |
| PWA | vite-plugin-pwa (Workbox) |
| Geocoding | PDOK Locatieserver |

The API, i18n, theme, and utility logic is shared with the native app (identical source files), so both apps behave exactly the same.

## The API Proxy (important)

The browser cannot call waarneming.nl directly: the API does not send CORS headers. All requests therefore go through a same-origin path `/api/waarneming/...`:

- **Local (dev)**: the Vite dev proxy (`vite.config.ts`) forwards to waarneming.nl server-side, so no CORS issue.
- **Production (Vercel)**: `vercel.json` uses the low-level `routes` syntax with a **verbatim regex** — `^/api/waarneming/(.*)$` → `https://waarneming.nl/api/v1/$1`. This matters: the higher-level `rewrites` syntax compiles its `source` with path-to-regexp, and Vercel's production router treats a `:path(.*)` parameter as a *single* path segment — multi-segment API paths (`observations/around-point/`) then 404. The verbatim regex skips that compilation entirely and also preserves the trailing slash that every v1 endpoint requires. No serverless function is involved — Vercel's edge does the proxying.

PDOK does allow CORS and is called directly.

## Running Locally

```bash
npm install
npm run dev          # http://localhost:5173
```

### Scripts

```bash
npm run typecheck    # tsc -b
npm run lint         # eslint
npm test             # vitest
npm run build        # production build (dist/)
npm run preview      # preview the build locally
```

## Deploying to Vercel

This folder (`web/`) is the Vercel root.

1. Import the repo in Vercel and set **Root Directory** to `web`.
2. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
3. `vercel.json` (low-level `routes`) does three things in order: serve build output from the filesystem, proxy `/api/waarneming/...` to waarneming.nl (see above), and provide the SPA fallback (all non-`/api` routes → `index.html`). No serverless functions, no extra configuration.

No environment variables or API keys required.

## Structure

```
vercel.json                   # /api/waarneming/* → waarneming.nl proxy + SPA fallback
src/
  api/          # fetch client (via proxy), endpoints, types (shared with native)
  features/
    map/        # Leaflet map, borders, circle, clustering, data hooks
    filters/    # species group chips, filter panel, filter store
    search/     # search overlay
    detail/     # detail screen + observation row
  components/   # generic UI (empty/loading/error states)
  theme/        # colors + dark mode hook
  i18n/nl.ts    # Dutch strings
  utils/        # geo, dates, filters
  index.css     # theme (CSS variables, light/dark)
  app.css       # component styling
```
