import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite proxy configuration for DriveEase.
 *
 * All three route prefixes are now registered in the API Gateway:
 *   /ms1/** -> lb://USER-SERVICE     :8001
 *   /ms2/** -> lb://VEHICLE-SERVICE  :8002
 *   /ms3/** -> lb://BOOKING-SERVICE  :8003
 *
 * The Vite dev server proxies every request through the single
 * API Gateway entry point at http://localhost:8000.
 *
 * Final development architecture:
 *   Browser :5173
 *       ↓  (Vite proxy)
 *   API Gateway :8000
 *       ├── /ms1/** → USER-SERVICE    :8001
 *       ├── /ms2/** → VEHICLE-SERVICE :8002
 *       └── /ms3/** → BOOKING-SERVICE :8003
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ms1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ms2': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ms3': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
