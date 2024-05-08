import { execSync } from 'child_process';
import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import { visualizer } from 'rollup-plugin-visualizer';
import { Plugin } from 'vite';
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

const pluginPuppeteer = async (mode: string): Promise<Plugin> => {
  const browser = await createBrowser({ devtools: mode === 'development' });
  let launched = false;

  return {
    configureServer(server) {
      const openPage = async () => {
        const a = server.httpServer?.address();
        const port = (typeof a === 'string' ? a : a?.port) ?? '4173';
        const postfix = mode === 'test' ? '/__vitest__/#/' : '';
        const url = `http://localhost:${port.toString()}${postfix}`;

        if (!launched) {
          const [firstPage] = await browser.pages();
          await firstPage.goto(url);
          launched = true;
        }
      };
      server.httpServer?.on('listening', () => {
        void openPage();
      });
      server.httpServer?.on('close', () => {
        void browser.close();
      });
      browser.on('disconnected', () => {
        void server.close();
        process.exit(0);
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
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [
    mode !== 'production' && pluginPuppeteer(mode),
    tsconfigPaths(),
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    checker({
      eslint: {
        dev: { logLevel: ['error', 'warning'] },
        lintCommand:
          mode === 'test'
            ? // exclude tsx files for eslint during test for now
              "eslint 'test/**/*.ts' 'src/**/*.test.ts'"
            : 'eslint . --ext ts,tsx',
        useFlatConfig: false,
      },
      overlay: {
        badgeStyle: 'background-color: transparent; font-size: 0.75em;',
        initialIsOpen: false,
        panelStyle: 'height: 100%; background-color: #232125;',
      },
      root: process.cwd(),
      terminal: false,
      typescript: {
        tsconfigPath: './tsconfig.json',
      },
    }),
    // {
    //   name: 'watch-external',
    //   configureServer(server) {
    //     // Use Vite's internal watcher to watch the .eslintrc file
    //     server.watcher.add('.eslintrc.cjs');
    //     server.watcher.on('change', (path) => {

    //         console.log('.eslintrc changed, reloading server...');
    //         // Restart the Vite server
    //         server.hot.send({
    //           type: 'full-reload',
    //           triggeredBy: 'eslint',
    //           // type: 'custom',
    //           path: '*' // You can specify more granular paths if needed
    //         });

    //     });
    //   }
    // },
    visualizer({
      brotliSize: true,
      filename: `./.analyzer/analysis_${dayjs().format('DDMMYYYY_HHmmss')}.html`,
      // or sunburst
      gzipSize: true,
      // sourcemap: true,
      projectRoot: process.cwd(),
      template: 'treemap',
      title: 'Vite Visualizer', // will be saved in project's root
    }),
    inspect(),
  ],
  preview: {
    headers: noCacheHeaders,
    host: '0.0.0.0',
    open: false,
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
    // open: true, // needs cli argument --open to work
    proxy: {
      // '/__open-in-editor': {
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/__open-in-editor': '',
      //   },
      //   target: `http://${getHostIp()}`,
      // },
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
