import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const rommUrl = env.VITE_ROMM_URL || 'http://localhost:8080'

  return {
    server: {
      proxy: {
        '/romm-api': {
          target: rommUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/romm-api/, '/api'),
        },
      },
    },
  }
})
