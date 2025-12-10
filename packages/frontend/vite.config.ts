import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import sirv from 'sirv';
import { execSync } from 'child_process';

// Get git info for build
function getGitInfo() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    return { commit, commitShort, branch };
  } catch {
    return { commit: 'dev', commitShort: 'dev', branch: 'local' };
  }
}

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

const gitInfo = getGitInfo();

export default defineConfig({
  plugins: [react(), docsPlugin()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(gitInfo.commit),
    __BUILD_COMMIT_SHORT__: JSON.stringify(gitInfo.commitShort),
    __BUILD_BRANCH__: JSON.stringify(gitInfo.branch),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
