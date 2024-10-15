import { createProxyMiddleware } from 'http-proxy-middleware';
import moize from 'moize';
import { Plugin } from 'vite';

export const dynamicProxyPlugin = (): Plugin => {
  const getProxy = moize((endpoint: string) =>
    createProxyMiddleware({
      changeOrigin: true,
      pathRewrite: { [`^/api`]: endpoint },
      target: endpoint,
    })
  );

  return {
    configureServer(server) {
      // TODO: find out why this is not working, since the last time upgrading the packages
      server.middlewares.use('/api', (req, res, next) => {
        const endpoint = req.headers.endpoint as string;
        if (!endpoint) {
          return res.writeHead(400).end('Endpoint is required in headers');
        }

        const proxy = getProxy(endpoint);
        void proxy(req, res, next);
      });
    },
    name: 'dynamic-proxy',
  };
};
