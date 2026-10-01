import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // o corretor ortográfico (src/services/spellchecker.worker.ts) importa
  // a versão CommonJS do hunspell-asm dentro de um Web Worker — listada
  // aqui pro Vite já convertê-la ao iniciar, em vez de descobrir no meio
  // do uso (o que devolvia "504 Outdated Optimize Dep" até reiniciar)
  optimizeDeps: {
    include: ['hunspell-asm/dist/cjs/index.js'],
  },
  resolve: {
    alias: {
      // permite usar "@/algo" ao invés de "../../../algo"
      '@': path.resolve(__dirname, './src'),
    },
  },
})
