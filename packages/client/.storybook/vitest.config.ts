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
        tags: { exclude: ['skip:test'] },
      }),
    ],
    test: {
      browser: {
        api: { host: '0.0.0.0', port: 63315 },
        enabled: true,
        headless: true,
        instances: [{ browser: 'chromium' }],
        isolate: false,
        provider: 'playwright',
        ui: true,
      },
      setupFiles: ['./tests/setup.storybook.ts'],
    },
  })
);
