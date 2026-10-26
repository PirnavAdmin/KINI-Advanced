import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import process from 'node:process'
import { demoPaymentsPlugin } from './server/demo-payments/vitePlugin.js'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL
  // Demo payments exist only on the dev server. Refuse to build a bundle that
  // would show the demo gateway instead of the real one.
  if (command === 'build' && env.VITE_PAYMENT_MODE === 'demo') {
    throw new Error('VITE_PAYMENT_MODE=demo is development-only. Remove it before building.')
  }
  const apiOrigin = (() => {
    try { return apiBaseUrl ? new URL(apiBaseUrl).origin : null } catch { return null }
  })()

  return {
    plugins: [
      react(),
      tailwindcss(),
      demoPaymentsPlugin({ enabled: env.DEMO_PAYMENTS_ENABLED === 'true' }),
    ],
    server: {
      port: 5173,
      strictPort: true,
      // Uploaded files (profile photos) are served same-origin through this
      // proxy during development.
      // See resolvePhotoUrl in src/shared/services/profilePhotoService.js.
      proxy: apiOrigin ? {
        '/uploads': {
          target: apiOrigin,
          changeOrigin: true,
        },
      } : undefined,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
  }
})
