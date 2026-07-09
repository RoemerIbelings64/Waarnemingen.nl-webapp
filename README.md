# Natuurkaart — PWA 🌿

Progressive Web App (React + TypeScript + Vite) van de Natuurkaart-app: bekijk
recente natuurwaarnemingen op een interactieve kaart, in de browser en
installeerbaar op je toestel. Zelfde functionaliteit en ontwerp als de native
app, data van [waarneming.nl](https://waarneming.nl).

## Functionaliteit

- 🗺️ Interactieve kaart (Leaflet) met geclusterde waarnemingspunten.
- 📍 Begrensd op **Nederland** — niet buiten de landsgrenzen pannen of uitzoomen.
- ⭕ De **zoekstraal** als cirkel op de kaart rond het middelpunt.
- 🔍 Zoeken op soort/familie en op Nederlandse plaats (PDOK).
- 🎛️ Filters: soortgroep, periode, zoekstraal.
- 📋 Lijst gegroepeerd op Vandaag / Gisteren / Deze week; detailscherm met foto's.
- 🌙 Dark mode (volgt systeem), volledig Nederlandse interface.
- 📲 Installeerbaar (PWA): manifest + service worker, kaarttegels offline gecachet.

## Techstack

| Onderdeel | Keuze |
|---|---|
| Build | Vite + React 19 + TypeScript |
| Kaart | Leaflet + react-leaflet, CARTO-basemaps (geen API-key) |
| Clustering | supercluster |
| Server-state | TanStack Query |
| UI-state | Zustand |
| Routing | react-router-dom |
| PWA | vite-plugin-pwa (Workbox) |
| Geocoding | PDOK Locatieserver |

De API-, i18n-, thema- en util-logica is gedeeld met de native app (identieke
bronbestanden), zodat beide apps zich exact hetzelfde gedragen.

## De API-proxy (belangrijk)

De browser kan waarneming.nl **niet** direct aanroepen: die API stuurt geen
CORS-headers. Daarom lopen alle verzoeken via een same-origin pad
`/api/waarneming/...`:

- **Lokaal (dev)**: de Vite dev-proxy (`vite.config.ts`) stuurt door naar
  waarneming.nl (server-side, dus geen CORS-probleem).
- **Productie (Vercel)**: de serverless-functie `api/waarneming/[...path].ts`
  doet hetzelfde en zet server-side de juiste headers.

PDOK staat CORS wél toe en wordt direct aangeroepen.

## Lokaal draaien

```bash
npm install
npm run dev          # http://localhost:5173
```

### Scripts

```bash
npm run typecheck    # tsc -b
npm run lint         # eslint
npm test             # vitest
npm run build        # productie-build (dist/)
npm run preview      # bekijk de build lokaal
```

## Deployen op Vercel

Deze map (`web/`) is de Vercel-root.

1. Importeer de repo in Vercel en zet **Root Directory** op `web`.
2. Framework preset: **Vite** (autodetectie). Build command `npm run build`,
   output `dist`.
3. De map `api/` wordt automatisch als serverless-functie gedeployed; de
   frontend praat met `/api/waarneming/...` — geen extra config nodig.
4. `vercel.json` regelt de SPA-fallback (alle niet-`/api`-routes → `index.html`).

Geen omgevingsvariabelen of API-keys nodig.

## Structuur

```
api/waarneming/[...path].ts   # Vercel serverless-proxy naar waarneming.nl
src/
  api/          # fetch-client (via proxy), endpoints, types  (gedeeld met native)
  features/
    map/        # Leaflet-kaart, grenzen, cirkel, clustering, data-hooks
    filters/    # soortgroep-chips, filterpaneel, filter-store
    search/     # zoekoverlay
    detail/     # detailscherm + waarnemingsrij
  components/   # generieke UI (lege/laad-/foutweergaven)
  theme/        # kleuren + dark-mode-hook
  i18n/nl.ts    # Nederlandse teksten
  utils/        # geo, datums, filters
  index.css     # thema (CSS-variabelen, light/dark)
  app.css       # componentstyling
```
