const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/oauth2/v2.0/token',
    createProxyMiddleware({
      target: 'https://login.microsoftonline.com',
      changeOrigin: true,
      pathRewrite: {
        '^/oauth2/v2.0/token': '/214c82c1-0619-42f5-a216-1c01bf4e5779/oauth2/v2.0/token',
      },
    })
  );
};