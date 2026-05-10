import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    proxy: {
      // /gw/... → http://localhost:3000/...  (API Gateway)
      '/gw': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gw/, ''),
      },
      // /ms/... → http://localhost:3001/...  (ms-kpis directo)
      '/ms': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ms/, ''),
      },
    },
  },
})
