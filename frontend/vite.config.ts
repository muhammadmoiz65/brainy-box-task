import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  server: {
    host:true,
    port: 3000,
  },
  proxy: {
    '/api': {
      target: 'http://backend:8080', // Backend running on Docker
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  },
});
