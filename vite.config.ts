import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Actions supplies the repository name; local previews use the same path.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base =
  process.env.VITE_BASE_PATH ||
  (repository
    ? repository.endsWith('.github.io')
      ? '/'
      : `/${repository}/`
    : '/Viagem_Grecia_2026/');
if (!base.startsWith('/') || !base.endsWith('/'))
  throw new Error('VITE_BASE_PATH deve começar e terminar com /.');

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'],
      manifest: {
        id: base,
        name: 'Atenas 2026 · Minha viagem',
        short_name: 'Atenas 2026',
        description: 'Seu roteiro, gastos e documentos de viagem, também offline.',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f6f5ef',
        theme_color: '#174f4b',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        // No third-party caching: personal files live exclusively in IndexedDB.
        runtimeCaching: [],
      },
    }),
  ],
});
