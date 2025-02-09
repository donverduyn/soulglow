import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig as never,
  defineConfig({
    plugins: [
      storybookTest({
        // The location of your Storybook config, main.js|ts
        configDir: dirname,
        // This should match your package.json script to run Storybook
        // The --ci flag will skip prompts and not open a browser
        storybookScript: 'yarn sb --ci',
      }),
    ],
    test: {
      // Enable browser mode
      browser: {
        enabled: true,
        headless: true,

        name: 'chromium',
        // Make sure to install Playwright
        provider: 'playwright',
      },
      setupFiles: ['./vitest.setup.ts'],
    },
  })
);
