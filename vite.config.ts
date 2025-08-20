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
    rollupOptions: {
      input: {
        admin: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/main.tsx'),
        dashboard: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/dashboard.tsx')
      },
      external: [],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'tailwind.css') {
            return 'admin.css'
          }
          return '[name].[ext]'
        },
        chunkFileNames: '[name].js',
        globals: {}
      }
    },
    outDir: 'assets/dist',
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