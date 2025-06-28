const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to Geoguessr
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://www.geoguessr.com',
      changeOrigin: true,
      secure: true,
      followRedirects: true,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Handle authentication token from custom header
        if (req.headers['x-auth-token']) {
          proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
        }
        
        // Forward existing cookies if any
        if (req.headers.cookie) {
          const existingCookies = req.headers.cookie;
          const authCookie = req.headers['x-auth-token'] ? `_ncfa=${req.headers['x-auth-token']}` : '';
          const combinedCookies = authCookie ? `${existingCookies}; ${authCookie}` : existingCookies;
          proxyReq.setHeader('Cookie', combinedCookies);
        } else if (req.headers['x-auth-token']) {
          proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
        }
        
        // Ensure proper headers
        proxyReq.setHeader('Referer', 'https://www.geoguessr.com/');
        proxyReq.setHeader('Origin', 'https://www.geoguessr.com');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Remove the custom auth header so it doesn't get forwarded
        proxyReq.removeHeader('x-auth-token');
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', message: err.message });
      },
      logLevel: 'debug'
    })
  );

  // Proxy game server requests
  app.use(
    '/game-api',
    createProxyMiddleware({
      target: 'https://game-server.geoguessr.com',
      changeOrigin: true,
      pathRewrite: {
        '^/game-api': '/api'
      },
      secure: true,
      followRedirects: true,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Handle authentication token from custom header
        if (req.headers['x-auth-token']) {
          proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
        }
        
        // Forward existing cookies if any
        if (req.headers.cookie) {
          const existingCookies = req.headers.cookie;
          const authCookie = req.headers['x-auth-token'] ? `_ncfa=${req.headers['x-auth-token']}` : '';
          const combinedCookies = authCookie ? `${existingCookies}; ${authCookie}` : existingCookies;
          proxyReq.setHeader('Cookie', combinedCookies);
        } else if (req.headers['x-auth-token']) {
          proxyReq.setHeader('Cookie', `_ncfa=${req.headers['x-auth-token']}`);
        }
        
        proxyReq.setHeader('Referer', 'https://www.geoguessr.com/');
        proxyReq.setHeader('Origin', 'https://www.geoguessr.com');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Remove the custom auth header so it doesn't get forwarded
        proxyReq.removeHeader('x-auth-token');
      }
    })
  );
}; 