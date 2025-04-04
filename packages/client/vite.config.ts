import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import dayjs from 'dayjs';
import postcssPresetEnv from 'postcss-preset-env';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import codegen from 'vite-plugin-graphql-codegen';
import graphqlLoader from 'vite-plugin-graphql-loader';
import inspect from 'vite-plugin-inspect';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';
import { noCacheHeaders } from './.vite/config/header';
import { browser } from './.vite/plugins/vite-plugin-browser';
import { createIpcNotifierPlugin } from './.vite/plugins/vite-plugin-codegen-ipc';
import { dynamicProxyPlugin } from './.vite/plugins/vite-plugin-dynamic-proxy';
import { config, internalPlugins, internalHooks } from './codegen.client';

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
        // eslint: {
        //   dev: { logLevel: ['error', 'warning'] },
        //   lintCommand: 'eslint ./**/*.{js,cjs,ts,tsx,mdx,gql}',
        //   useFlatConfig: false,
        // },
        overlay: {
          badgeStyle:
            'background-color: white; font-size: 0.75em; color: black;',
          initialIsOpen: false,
          panelStyle: 'height: 100%; background-color: #232125;',
        },
        root: process.cwd(),
        // stylelint: {
        //   dev: { logLevel: ['error', 'warning'] },
        //   lintCommand: 'stylelint "src/**/*.{css,tsx}"',
        // },
        terminal: true,
        // typescript: { buildMode: true, tsconfigPath: './tsconfig.app.json' },
      })
    );
    devPlugins.push(inspect({}));
    devPlugins.push(browser(mode));
    devPlugins.push(
      createIpcNotifierPlugin({
        name: 'codegen',
        onStartMessage: 'pause',
        onStopMessage: 'resume',
        // silent: false, // enable to see errors in logs
      })
    );
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
            // '@react': ['react', 'react-dom'],
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
      graphqlLoader(),
      codegen({
        config,
        configOverride: { generates: internalPlugins, hooks: internalHooks },
        runOnBuild: process.env.CI !== 'true',
      }),
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
      mode === 'production' &&
        viteStaticCopy({
          targets: [
            {
              dest: '',
              src: path.resolve(__dirname, './src/assets/locales/**/*'),
            },
          ],
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
      alias: [
        ...(mode === 'development'
          ? [
              {
                find: 'i18n',
                replacement: path.resolve(__dirname, './src/i18n.dev.ts'),
              },
            ]
          : []),
        {
          find: /(.+)\.gql$/,
          replacement: '/src/__generated/gql/operations.ts',
        },
        {
          // TODO: Remove this alias once the issue is fixed
          // https://github.com/tabler/tabler-icons/issues/1233
          find: '@tabler/icons-react',
          replacement: '@tabler/icons-react/dist/esm/icons/index.mjs',
        },
      ],
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
