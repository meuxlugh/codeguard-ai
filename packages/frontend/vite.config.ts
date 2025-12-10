import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import sirv from 'sirv';

// Plugin to serve static docs in dev mode
function docsPlugin(): Plugin {
  return {
    name: 'serve-docs',
    configureServer(server) {
      const docsPath = resolve(__dirname, '../../docs/site');
      server.middlewares.use('/docs', sirv(docsPath, { dev: true, single: false }));
    },
  };
}

export default defineConfig({
  plugins: [react(), docsPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
