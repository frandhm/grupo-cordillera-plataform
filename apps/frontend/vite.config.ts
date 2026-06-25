import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    proxy: {
      // IMPORTANTE: /ms-eq y /ms-mt DEBEN ir ANTES que /ms
      // Vite evalúa en orden y /ms matchearía /ms-eq antes de llegar aquí.

      // /gw/... → http://localhost:3000 (API Gateway)
      '/gw': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gw/, ''),
      },
      // /ms-eq/... → http://localhost:3003 (ms-equipos)
      '/ms-eq': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ms-eq/, ''),
      },
      // /ms-mt/... → http://localhost:3002 (ms-metas)
      '/ms-mt': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ms-mt/, ''),
      },
      // /ms/... → http://localhost:3001 (ms-kpis) — DEBE IR AL FINAL
      '/ms': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ms/, ''),
      },
    },
  },
})
