import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend origin the dev server proxies /api and /ws to. Defaults to the
// deployed ALB so `npm run dev` on localhost drives the live cloud backend
// (localhost is a secure context, so the webcam works). Override with
// VITE_BACKEND_ORIGIN for a local backend, e.g. http://localhost:8000.
const backend = process.env.VITE_BACKEND_ORIGIN
  || 'http://kyc-alb-1442133242.us-east-1.elb.amazonaws.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Allow the dev server to answer requests forwarded from a Cloudflare
    // tunnel (or any external host), whose Host header Vite would otherwise
    // reject. Fine for a demo dev server.
    allowedHosts: true,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/ws': { target: backend, changeOrigin: true, ws: true },
      // Live lab backends (local Docker containers). Each strips its prefix.
      '/pp-api': { target: 'http://localhost:8091', changeOrigin: true, rewrite: (p) => p.replace(/^\/pp-api/, '') },
      '/cb-api': { target: 'http://localhost:8092', changeOrigin: true, rewrite: (p) => p.replace(/^\/cb-api/, '') },
    },
  },
})
