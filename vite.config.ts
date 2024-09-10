import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import moize from 'moize';
import postcssPresetEnv from 'postcss-preset-env';
import { visualizer } from 'rollup-plugin-visualizer';
import { Plugin, ViteDevServer } from 'vite';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { createBrowser } from './scripts/browser';

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Expires: '0',
  Pragma: 'no-cache',
};

const dynamicProxyPlugin = (): Plugin => {
  const getProxy = moize((endpoint: string) =>
    createProxyMiddleware({
      changeOrigin: true,
      pathRewrite: { [`^/api`]: endpoint },
      target: endpoint,
    })
  );

  return {
    configureServer(server) {
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

const browser = (mode: string): Plugin => {
  let launched = false;

  const openPage = (server: ViteDevServer) => {
    void createBrowser(
      { devtools: mode === 'development' },
      async (page, browser) => {
        const a = server.httpServer?.address();
        const port = (typeof a === 'string' ? a : a?.port) ?? '4173';
        const postfix = mode === 'test' ? '/__vitest__/#/' : '';
        const url = `http://localhost:${port.toString()}${postfix}`;

        await page.goto(url);
        browser.on('disconnected', () => {
          void server.close();
        });
        server.httpServer?.on('close', () => {
          void browser.close();
          process.exit(0);
        });
      }
    );
  };
  return {
    configureServer(server) {
      server.httpServer?.on('listening', () => {
        !launched && openPage(server);
        launched = true;
      });
    },
    name: 'puppeteer',
  };
};

// https://vitejs.dev/config/
// TODO: find the regression that causes the type mismatch. Seems to be version mismatch.
export default defineConfig(({ mode }) => ({
  build: {
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          '@culori': ['culori'],
          '@effect': ['effect'],
          '@emotion': ['@emotion/react', '@emotion/styled'],
          '@mobx': ['mobx', 'mobx-react-lite', 'mobx-utils'],
          '@mui': ['@mui/material', '@mui/icons-material'],
          '@react': ['react', 'react-dom'],
          '@utils': ['moize', 'uuid', '@hey-api/client-fetch'],
        },
      },
    },
    sourcemap: false,
  },
  css: {
    devSourcemap: true,
    postcss: { plugins: [postcssPresetEnv({ features: {} })] },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [
    mode !== 'production' && process.env.CI !== 'true' && browser(mode),
    dynamicProxyPlugin(),
    tsconfigPaths(),
    react({ jsxImportSource: '@emotion/react', tsDecorators: true }),
    checker({
      eslint: {
        dev: { logLevel: ['error', 'warning'] },
        lintCommand:
          mode === 'test'
            ? // exclude tsx files for eslint during test for now
              "eslint 'test/**/*.ts' 'src/**/*.test.ts'"
            : 'eslint ./**/*.{js,cjs,ts,tsx}',
        useFlatConfig: false,
      },
      overlay: {
        badgeStyle: 'background-color: white; font-size: 0.75em; color: black;',
        initialIsOpen: false,
        panelStyle: 'height: 100%; background-color: #232125;',
      },
      root: process.cwd(),
      stylelint:
        mode !== 'test'
          ? {
              dev: { logLevel: ['error', 'warning'] },
              lintCommand: 'stylelint "src/**/*.{css,tsx}"',
            }
          : false,
      terminal: false,
      typescript:
        process.env.CI === 'true' ? false : { tsconfigPath: './tsconfig.json' },
    }),
    visualizer({
      brotliSize: true,
      filename: `./.analyzer/analysis_${dayjs().format('DDMMYYYY_HHmmss')}.html`,
      gzipSize: true,
      projectRoot: process.cwd(),
      template: 'treemap',
      title: 'Vite Visualizer',
    }),
    inspect(),
  ],
  preview: {
    headers: noCacheHeaders,
    host: true,
    open: true,
    port: 4173,
    proxy: {
      '/api': {
        // The base URL of your API
        changeOrigin: true,
        // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: 'http://192.168.0.153:80',
      },
    },
  },
  resolve: { alias: {} },
  server: {
    headers: noCacheHeaders,
    hmr: { overlay: true },
    host: true,
    port: 4173,
    // proxy: {
    //   '/api': {
    //     // The base URL of your API
    //     changeOrigin: true,
    //     // Needed for virtual hosted sites
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //     target: 'http://192.168.0.153:80',
    //   },
    // },
  },
  test: {
    environment: 'happy-dom',
    // resolveSnapshotPath: (testPath, snapshotExtension) =>
    //   testPath.replace(/\.test\.(ts|tsx)$/, `.snap${snapshotExtension}`),
    // for testing types!
    // typecheck: {
    //   checker: 'tsc',
    //   tsconfig: './tsconfig.json',
    //   enabled: true,
    // },
    // reporters: ['html'],
    globals: true,
    // logHeapUsage: true,
    open: false,
  },
}));
