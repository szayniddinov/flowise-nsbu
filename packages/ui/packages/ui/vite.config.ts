import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Это укажет Vite направлять все API-запросы на серверную часть
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:10000',
    },
  },
})
