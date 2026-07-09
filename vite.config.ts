import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // permite usar "@/algo" ao invés de "../../../algo"
      '@': path.resolve(__dirname, './src'),
    },
  },
})
