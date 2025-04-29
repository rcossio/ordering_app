const { createProxyMiddleware } = require('http-proxy-middleware');

// This proxy redirects API calls from the React app to the backend server
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true
    })
  );
};