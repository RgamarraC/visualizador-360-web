import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/visualizador-360-web/',
  plugins: [react()],
  resolve: {
    dedupe: ['three']
  }
})
