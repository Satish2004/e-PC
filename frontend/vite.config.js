import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT) || 5173;

  return {
    plugins: [react()],
    assetsInclude: ['**/*.glb'],
    server: {
      port: port,
      strictPort: true, // This prevents Vite from randomly picking 5174, 5175, etc.
      host: true,       // Allows you to see the project on your mobile/network
      proxy: {
        '^/(auth|complaints|polls|schemes|notifications|ai)': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
