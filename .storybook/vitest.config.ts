import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), {
    plugins: [
      storybookTest({
        configDir: dirname,
        storybookScript: 'yarn sb --ci',
      }),
    ],
    test: {
      browser: {
        enabled: true,
        headless: true,
        instances: [{ browser: 'chromium' }],
        provider: 'playwright',
        ui: true,
      },
      globals: true,
      setupFiles: ['./tests/setup.storybook.ts'],
    },
  })
);
