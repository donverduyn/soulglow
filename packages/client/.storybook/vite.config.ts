import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, UserConfig, type AliasOptions } from 'vite';
import codegen from 'vite-plugin-graphql-codegen';
import graphqlLoader from 'vite-plugin-graphql-loader';
import tsconfigPaths from 'vite-tsconfig-paths';
import { mergeConfig, type ViteUserConfig } from 'vitest/config';
import { createIpcNotifierPlugin } from './../.vite/plugins/vite-plugin-codegen-ipc';
import removeExtraFontsPlugin from './../.vite/plugins/vite-plugin-remove-fonts';
import { config, internalHooks, internalPlugins } from './../codegen.client';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig((viteConfig: ViteUserConfig) => {
  const isDev = viteConfig.mode === 'development';
  return mergeConfig(viteConfig, {
    plugins: [
      react(),
      tsconfigPaths(),
      graphqlLoader(),
      codegen({
        config,
        configOverride: { generates: internalPlugins, hooks: internalHooks },
        runOnBuild: process.env.CI !== 'true',
      }),
      viteConfig.mode === 'development' &&
        createIpcNotifierPlugin({
          name: 'codegen',
          onStartMessage: 'pause',
          onStopMessage: 'resume',
          // silent: false, // enable to see errors in logs
        }),
      removeExtraFontsPlugin(),
      // visualizer({
      //   brotliSize: true,
      //   filename: `./.analyzer/analysis_${dayjs().format('DDMMYYYY_HHmmss')}.html`,
      //   gzipSize: true,
      //   projectRoot: process.cwd(),
      //   template: 'treemap',
      //   title: 'Vite Visualizer',
      // })
    ],
    // TODO: storybook refs only work using localhost, not 127.0.0.1?
    resolve: {
      alias: [
        isDev && {
          find: 'i18n',
          replacement: path.resolve(__dirname, '../src/i18n.dev.ts'),
        },
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
      ].filter(Boolean) as AliasOptions,
    },
    server: {
      // host: '0.0.0.0',
      // port: 6006,
      // proxy: {
      //   '/refs': {
      //     changeOrigin: true,
      //     target: 'https://google.com',
      //   },
      // },
      watch: {
        ignored: [
          path.resolve(__dirname, '../public/locales'),
          '**/node_modules/**',
          '**/dist/**',
        ],
      },
    },
  } satisfies UserConfig);
});
