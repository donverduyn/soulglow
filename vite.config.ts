import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import { visualizer } from 'rollup-plugin-visualizer';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths(),
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    checker({
      overlay: {
        initialIsOpen: false,
        panelStyle: 'height: 100%; background-color: #232125;',
        badgeStyle: 'background-color: transparent; font-size: 0.75em;',
      },
      terminal: false,
      root: process.cwd(),
      typescript: {
        tsconfigPath: './tsconfig.json',
      },
      eslint: {
        lintCommand:
          mode === 'test'
            ? // exclude tsx files for eslint during test for now
              "eslint 'test/**/*.ts' 'src/**/*.test.ts'"
            : 'eslint ./src --ext .ts,.tsx',
        useFlatConfig: false,
        dev: { logLevel: ['error', 'warning'] },
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
      template: 'treemap', // or sunburst
      gzipSize: true,
      brotliSize: true,
      // sourcemap: true,
      projectRoot: process.cwd(),
      title: 'Vite Visualizer',
      filename: `./.analyzer/analysis_${dayjs().format('DDMMYYYY_HHmmss')}.html`, // will be saved in project's root
    }),
    inspect(),
  ],
  resolve: {
    alias: {},
  },
  test: {
    // logHeapUsage: true,
    open: true,
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
    environment: 'happy-dom',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          '@react': ['react', 'react-dom'],
          '@emotion': ['@emotion/react', '@emotion/styled'],
          '@mui': ['@mui/material', '@mui/icons-material'],
          '@mobx': ['mobx', 'mobx-react-lite'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.0.153:80', // The base URL of your API
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    headers: noCacheHeaders,
    hmr: {
      overlay: true,
    },
  },
  preview: {
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'http://192.168.0.153:80', // The base URL of your API
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    headers: noCacheHeaders,
  },
}));
