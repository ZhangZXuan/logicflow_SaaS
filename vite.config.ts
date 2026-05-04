import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000'
  /** 后端若没有 /api/v1 全局前缀（路由直接是 /auth/...），在 .env.development 里设 VITE_PROXY_STRIP_PREFIX=true */
  const stripApiV1 = env.VITE_PROXY_STRIP_PREFIX === 'true'

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['logicflow-exclusive-gateway']
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          ...(stripApiV1 && {
            rewrite: (path) => path.replace(/^\/api\/v1/, ''),
          }),
        },
        '/api/flow': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }

      },
    },
  }
})
