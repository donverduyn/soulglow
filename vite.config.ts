import { execSync } from 'child_process';
import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
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

export const getHostIp = () => {
  const hostip = execSync("ip route show | awk '/default/ {print $3}'")
    .toString()
    .trim();
  return hostip;
};

const pluginBrowserLaunch = (mode: string): Plugin => {
  let launched = false;

  const openPage = (server: ViteDevServer) => {
    void createBrowser(
      { devtools: mode === 'development' },
      async (page, browser) => {
        const a = server.httpServer?.address();
        const port = (typeof a === 'string' ? a : a?.port) ?? '4173';
        const postfix = mode === 'test' ? '/__vitest__/#/' : '';
        const url = `http://127.0.0.1:${port.toString()}${postfix}`;

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
export default defineConfig(({ mode }) => ({
  build: {
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          '@emotion': ['@emotion/react', '@emotion/styled'],
          '@mobx': ['mobx', 'mobx-react-lite'],
          '@mui': ['@mui/material', '@mui/icons-material'],
          '@react': ['react', 'react-dom'],
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
    mode !== 'production' &&
      process.env.CI !== 'true' &&
      pluginBrowserLaunch(mode),
    tsconfigPaths(),
    react({
      jsxImportSource: '@emotion/react',
      plugins: [
        [
          '@swc/plugin-emotion',
          {
            importMap: {
              '@mui/material': {
                styled: {
                  canonicalImport: ['@emotion/styled', 'default'],
                  styledBaseImport: ['@mui/material', 'styled'],
                },
              },
              '@mui/material/styles': {
                // css: {
                //   canonicalImport: ['@emotion/react', 'css'],
                //   styledBaseImport: ['@mui/material/styles', 'css'],
                // },
                styled: {
                  canonicalImport: ['@emotion/styled', 'default'],
                  styledBaseImport: ['@mui/material/styles', 'styled'],
                },
              },
            },
            labelFormat: '-[local]',
          },
        ],
      ],
    }),
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
      typescript: {
        tsconfigPath: './tsconfig.json',
      },
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
    host: '0.0.0.0',
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
    host: '0.0.0.0',
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
