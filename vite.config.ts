import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from './package.json'

// When building inside Tauri (TAURI_ENV_* is injected by the Tauri CLI), skip the PWA
// service worker: it's meaningless in a packaged desktop app and an autoUpdate SW can
// serve stale assets / log registration errors on the tauri.localhost origin.
const isTauri = !!process.env.TAURI_ENV_PLATFORM

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isTauri
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            manifest: {
              name: 'GoalTracker',
              short_name: 'Goals',
              description: 'Beautiful local-first goal tracking',
              theme_color: '#0b0b14',
              background_color: '#0b0b14',
              display: 'standalone',
              icons: [
                { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
                { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
              ],
            },
          }),
        ]),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  // Keep the dev port fixed so it always matches Tauri's devUrl, and don't let Vite
  // clear the terminal under `tauri dev`.
  server: { port: 5173, strictPort: true },
  clearScreen: false,
})
