import { join, dirname } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import type { UserConfig } from 'vite';
import { noCacheHeaders } from '../.vite/config/header';
import VitePluginRestart from './../.vite/plugins/vite-plugin-restart';

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: { docs: false },
    },
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-dark-mode'),
  ],
  core: { disableWhatsNewNotifications: true },
  features: {
    backgroundsStoryGlobals: true,
    viewportStoryGlobals: true,
  },
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      builder: { viteConfigPath: './.storybook/vite.config.ts' },
      strictMode: true,
    },
  },
  refs: (_, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        mantine: {
          expanded: true,
          sourceUrl: 'https://github.com/mantinedev/mantine',
          title: 'Mantine',
          url: 'http://localhost:6005',
        },
      };
    } else {
      return {};
    }
  },
  staticDirs: ['../public'],
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../src/**/*.mdx'],
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const { viteStaticCopy } = await import('vite-plugin-static-copy');
    return mergeConfig(config, {
      build: {
        chunkSizeWarningLimit: 1024,
        rollupOptions: {
          onwarn(warning, warn) {
            const isUseClientWarning =
              warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
              warning.message.includes(`"use client"`);
            if (!isUseClientWarning) warn(warning);
          },
        },
      },
      plugins: [
        process.env.NODE_ENV === 'development' &&
          viteStaticCopy({
            targets: [
              {
                dest: '',
                src: './node_modules/msw/lib/mockServiceWorker.js',
              },
            ],
          }),
        process.env.NODE_ENV === 'development' &&
          VitePluginRestart({
            reload: ['./public/**/*'],
            restart: ['.storybook/**/*'],
          }),
      ],
      server: { headers: noCacheHeaders },
    } satisfies UserConfig);
  },
};
export default config;
