import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const target = process.env.BUILD_TARGET || 'auto';
  const outDir = target === 'admin' ? 'dist-admin' : target === 'client' ? 'dist-client' : 'dist';

  return {
    plugins: [react()],
    define: {
      '__BUILD_TARGET__': JSON.stringify(target)
    },
    build: {
      outDir,
      emptyOutDir: true
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
  };
});
