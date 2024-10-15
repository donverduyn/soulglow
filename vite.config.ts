import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import postcssPresetEnv from 'postcss-preset-env';
import { visualizer } from 'rollup-plugin-visualizer';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { browser } from './.vite/plugins/vite-plugin-browser';
import { dynamicProxyPlugin } from './.vite/plugins/vite-plugin-dynamic-proxy';
import { noCacheHeaders } from './.vite/utils/cache';

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error vite version mismatch
export default defineConfig(({ mode }) => ({
  build: {
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          '@culori': ['culori/fn'],
          '@effect': ['effect'],
          '@emotion': ['@emotion/react', '@emotion/styled'],
          '@mantine': [
            '@mantine/charts',
            '@mantine/hooks',
            '@mantine/core',
            '@mantine/form',
            '@mantine/modals',
            '@mantine/notifications',
          ],
          '@mobx': ['mobx', 'mobx-react-lite', 'mobx-utils'],
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
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', { sourceMap: true }]],
    }),
    VitePWA({
      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
      filename: 'worker.ts',
      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico}',
          'fonts/*.{woff,woff2,ttf,otf}',
        ],
      },
      injectRegister: 'script-defer',
      manifest: {
        description: 'milight-ui',
        name: 'milight-ui',
        short_name: 'milight-ui',
        theme_color: '#ffffff',
      },

      pwaAssets: {
        config: './pwa.config.ts',
        disabled: false,
      },
      registerType: 'autoUpdate',
      srcDir: 'src',
      strategies: 'injectManifest',
    }),
    checker({
      eslint: {
        dev: { logLevel: ['error', 'warning'] },
        lintCommand:
          mode === 'test'
            ? // exclude tsx files for eslint during test for now
              "eslint 'tests/**/*.ts' 'src/**/*.test.ts' --cache --cache-location node_modules/.cache/.eslintcache"
            : 'eslint ./**/*.{js,cjs,ts,tsx} --cache --cache-location node_modules/.cache/.eslintcache',
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
      terminal: mode === 'development',
      typescript:
        process.env.CI === 'true'
          ? false
          : { tsconfigPath: './tsconfig.app.json' },
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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: 'http://192.168.0.153:80',
      },
    },
  },
  resolve: { alias: {}, extensions: ['.js', '.ts', '.tsx'] },
  server: {
    headers: noCacheHeaders,
    hmr: { overlay: true },
    host: '127.0.0.1',
    port: 4173,
    watch: {
      ignored: ['!**/node_modules/your-package-name/**'],
    },
  },
  test: {
    coverage: { provider: 'v8', reporter: 'html' },
    css: false,
    environment: 'happy-dom',
    globals: true,
    open: false,
    setupFiles: ['./tests/setup.ts'],
    // resolveSnapshotPath: (testPath, snapshotExtension) =>
    //   testPath.replace(/\.test\.(ts|tsx)$/, `.snap${snapshotExtension}`),
    typecheck: {
      checker: 'tsc',
      enabled: false, // this is already handled by the linter
      // enabled: process.env.CI === 'true',
      include: ['./tests/**/*.{ts,tsx}'],
      tsconfig: './tsconfig.node.json',
    },
    // reporters: ['html'],
    // logHeapUsage: true,
  },
}));
