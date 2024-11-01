import { Plugin, ViteDevServer } from 'vite';
import { createBrowser } from '../../scripts/browser';

export const browser = (mode: string): Plugin => {
  let launched = false;

  const openPage = (server: ViteDevServer) => {
    if (process.env.INTERNAL_CHROMIUM)
      void createBrowser(
        { devtools: mode === 'development' },
        async (page, browser) => {
          const a = server.httpServer?.address();
          const port = (typeof a === 'string' ? a : a?.port) ?? '4173';
          const postfix = mode === 'test' ? '/__vitest__/#/' : '';
          const url = `http://localhost:${port.toString()}${postfix}`;

          await page.goto(url);
          server.httpServer?.on('close', () => {
            void browser.close();
          });
        }
      );
  };

  return {
    configureServer(server) {
      server.httpServer?.on('listening', () => {
        if (!launched) {
          openPage(server);
          launched = true;
        }
      });
    },
    name: 'puppeteer',
  };
};
