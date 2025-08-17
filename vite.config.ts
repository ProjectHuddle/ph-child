import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/main.tsx'),
      name: 'SureFeedbackAdmin',
      fileName: 'surefeedback-admin',
      formats: ['umd']
    },
    outDir: 'assets/dist',
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: 'surefeedback-admin.[ext]',
        globals: {}
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')
    }
  }
})