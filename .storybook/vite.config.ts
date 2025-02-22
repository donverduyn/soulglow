import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { UserConfig } from 'vite';
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';
import removeExtraFontsPlugin from './../.vite/plugins/vite-plugin-remove-fonts';

export default (config: ViteUserConfig) => {
  return mergeConfig(config, {
    plugins: [react(), tsconfigPaths(), removeExtraFontsPlugin()],
    // TODO: storybook refs only work using localhost, not 127.0.0.1?
    resolve: {
      alias: {
        // TODO: Remove this alias once the issue is fixed
        // https://github.com/tabler/tabler-icons/issues/1233
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },

    server: {
      watch: {
        ignored: [
          path.resolve(__dirname, '../public/locales'),
          '**/node_modules/**',
          '**/dist/**',
        ],
      },
    },
  } satisfies UserConfig);
};
