import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import postcssPresetEnv from 'postcss-preset-env';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { noCacheHeaders } from './.vite/config/header';
import { browser } from './.vite/plugins/vite-plugin-browser';
import { dynamicProxyPlugin } from './.vite/plugins/vite-plugin-dynamic-proxy';

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error vite version mismatch
export default defineConfig(async ({ mode }) => {
  const devPlugins = [];
  if (mode === 'development') {
    const { i18nextHMRPlugin } = await import('i18next-hmr/vite');
    devPlugins.push(i18nextHMRPlugin({ localesDir: './public/locales' }));
    devPlugins.push(
      checker({
        eslint: {
          dev: { logLevel: ['error', 'warning'] },
          lintCommand:
            // mode === 'test'
            //? // exclude tsx files for eslint during test for now
            "eslint './tests/**/*.ts' './src/**/*.test.ts'",
          // : 'eslint ./**/*.{js,cjs,ts,tsx,mdx}',
          useFlatConfig: false,
        },
        overlay: {
          badgeStyle:
            'background-color: white; font-size: 0.75em; color: black;',
          initialIsOpen: false,
          panelStyle: 'height: 100%; background-color: #232125;',
        },
        root: process.cwd(),
        stylelint:
          //mode !== 'test'
          //? {
          {
            dev: { logLevel: ['error', 'warning'] },
            lintCommand: 'stylelint "src/**/*.{css,tsx}"',
          },
        // : false,
        terminal: true,
        typescript:
          // process.env.CI === 'true'
          //   ? false
          { buildMode: true, tsconfigPath: './tsconfig.app.json' },
      })
    );
    devPlugins.push(inspect({}));
    devPlugins.push(browser(mode));
  }
  return {
    build: {
      minify: 'esbuild',
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            '@culori': ['culori/fn'],
            '@effect': ['effect'],
            // '@emotion': ['@emotion/react', '@emotion/styled'],
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
      watch: false,
    },
    css: {
      devSourcemap: true,
      postcss: { plugins: [postcssPresetEnv({ features: {} })] },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
    experimental: {
      hmrPartialAccept: true,
    },
    plugins: [
      dynamicProxyPlugin(),
      tsconfigPaths(),
      react(),
      ...devPlugins,
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
      visualizer({
        brotliSize: true,
        filename: `./.analyzer/analysis_${dayjs().format('DDMMYYYY_HHmmss')}.html`,
        gzipSize: true,
        projectRoot: process.cwd(),
        template: 'treemap',
        title: 'Vite Visualizer',
      }),
    ],
    preview: {
      headers: noCacheHeaders,
      host: true,
      open: true,
      port: 4173,
      proxy: {
        '/api': {
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          target: 'http://192.168.0.153:80',
        },
      },
    },
    resolve: {
      alias: {
        // TODO: find out why this won't work
        // '.vite': path.resolve(__dirname, '.vite'),
        // TODO: Remove this alias once the issue is fixed
        // https://github.com/tabler/tabler-icons/issues/1233
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
      extensions: ['.js', '.ts', '.tsx'],
    },
    server: {
      headers: noCacheHeaders,
      hmr: { overlay: true },
      host: '127.0.0.1',
      port: 4173,
      // watch: {
      //   ignored: ['!**/node_modules/your-package-name/**'],
      // },
    },
  };
});
