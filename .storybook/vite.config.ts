import { defineConfig, mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import removeExtraFontsPlugin from './../.vite/plugins/vite-plugin-remove-fonts';

export default defineConfig((config) => {
  return mergeConfig(config, {
    plugins: [tsconfigPaths(), removeExtraFontsPlugin()],
    resolve: {
      alias: {
        // TODO: Remove this alias once the issue is fixed
        // https://github.com/tabler/tabler-icons/issues/1233
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
  });
});
