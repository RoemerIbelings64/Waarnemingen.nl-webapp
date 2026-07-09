import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Natuurkaart',
        short_name: 'Natuurkaart',
        description:
          'Bekijk recente natuurwaarnemingen op een kaart — data van waarneming.nl.',
        lang: 'nl',
        theme_color: '#1B4332',
        background_color: '#F7F5EF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Laat API-verzoeken altijd naar het netwerk gaan (TanStack Query
        // cachet al in het geheugen); alleen de app-shell wordt precached.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://basemaps.cartocdn.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // Lokale dev: proxy naar waarneming.nl (server-side, dus geen CORS-probleem).
    proxy: {
      '/api/waarneming': {
        target: 'https://waarneming.nl/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/waarneming/, ''),
        // Zelfde browser-User-Agent als de productie-proxy, zodat dev en Vercel
        // identieke upstream-verzoeken sturen.
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        },
      },
    },
  },
});
