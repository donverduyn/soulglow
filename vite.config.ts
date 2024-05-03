import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import { visualizer } from 'rollup-plugin-visualizer';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Expires: '0',
  Pragma: 'no-cache',
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
            : 'eslint ./src --ext .ts,.tsx',
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
    open: true,
    port: 4174,
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
    open: true,
  },
}));
