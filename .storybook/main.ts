import { join, dirname } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import type { UserConfig } from 'vite';
import VitePluginRestart from './../.vite/plugins/vite-plugin-restart';
import { noCacheHeaders } from './../.vite/utils/cache';

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-dark-mode'),
  ],
  core: { disableWhatsNewNotifications: true },
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: { builder: { viteConfigPath: './vite.config.ts' } },
  },
  refs: () => ({
    mantine: {
      expanded: true,
      sourceUrl: 'https://github.com/mantinedev/mantine',
      title: 'Mantine',
      url: 'http://localhost:6005',
    },
  }),
  staticDirs: ['../public'],
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      plugins: [
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
