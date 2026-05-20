import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
    host: host || '0.0.0.0',
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 3001,
        }
      : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  build: {
    outDir: 'dist',
  },
})
