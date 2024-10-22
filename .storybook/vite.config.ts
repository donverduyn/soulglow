import { defineConfig, mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import removeExtraFontsPlugin from '../.vite/plugins/vite-plugin-remove-fonts';

export default defineConfig((config) => {
  return mergeConfig(config, {
    plugins: [tsconfigPaths(), removeExtraFontsPlugin()],
  });
});
