import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'ShramSuraksha Pro',
        short_name: 'ShramSuraksha',
        description: 'AI-Powered Gig Worker Protection',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icons.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
  }
})

