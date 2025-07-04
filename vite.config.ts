import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration
 * 
 */
export default defineConfig(() => ({
  base: '/geoguessr-challenge-tracker/',
  plugins: [
    react({
      // enable JSX in .js/.jsx/.ts/.tsx files
      include: '**/*.{js,jsx,ts,tsx}',
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.geoguessr.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        onProxyReq(proxyReq, req, res) {
          if (req.headers['x-auth-token']) {
            proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
          }

          if (req.headers.cookie) {
            const existingCookies = req.headers.cookie;
            const authCookie = req.headers['x-auth-token']
              ? `_ncfa=${req.headers['x-auth-token']}`
              : '';
            const combinedCookies = authCookie
              ? `${existingCookies}; ${authCookie}`
              : existingCookies;
            proxyReq.setHeader('Cookie', combinedCookies);
          } else if (req.headers['x-auth-token']) {
            proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
          }

          proxyReq.setHeader('Referer', 'https://www.geoguessr.com/');
          proxyReq.setHeader('Origin', 'https://www.geoguessr.com');
          proxyReq.setHeader(
            'User-Agent',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          );
          proxyReq.removeHeader('x-auth-token');
        },
        onError(err, req, res) {
          console.error('Proxy error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
        },
        logLevel: 'debug',
      },
      '/game-api': {
        target: 'https://game-server.geoguessr.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/game-api/, '/api'),
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        onProxyReq(proxyReq, req, res) {
          if (req.headers['x-auth-token']) {
            proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
          }

          if (req.headers.cookie) {
            const existingCookies = req.headers.cookie;
            const authCookie = req.headers['x-auth-token']
              ? `_ncfa=${req.headers['x-auth-token']}`
              : '';
            const combinedCookies = authCookie
              ? `${existingCookies}; ${authCookie}`
              : existingCookies;
            proxyReq.setHeader('Cookie', combinedCookies);
          } else if (req.headers['x-auth-token']) {
            proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
          }

          proxyReq.setHeader('Referer', 'https://www.geoguessr.com/');
          proxyReq.setHeader('Origin', 'https://www.geoguessr.com');
          proxyReq.setHeader(
            'User-Agent',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          );
          proxyReq.removeHeader('x-auth-token');
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mantine') || id.includes('@tabler/icons-react')) {
              return 'mantine';
            }
            if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
              return 'charts';
            }
            return 'vendor';
          }
        }
      }
    }
  },
}));
