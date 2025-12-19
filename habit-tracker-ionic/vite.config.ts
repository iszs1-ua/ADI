/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'Gestor de hábitos con Ionic y Vue',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'assets/icon/icon.png', // Asegúrate de tener una imagen aquí (en la carpeta public)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/icon/icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
