import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './.storybook/vite.config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      plugins: [
        storybookTest({
          // The location of your Storybook config, main.js|ts
          configDir: dirname + '/.storybook',
          // This should match your package.json script to run Storybook
          // The --ci flag will skip prompts and not open a browser
          storybookScript: 'yarn sb --ci',
        }),
      ],
      test: {
        coverage: { provider: 'v8', reporter: 'html' },
        css: false,
        deps: { optimizer: { web: { enabled: true } } },
        environment: 'happy-dom',
        globals: true,
        include: ['./tests/**/*.test.{ts,tsx}', './src/**/*.test.{ts,tsx}'],
        isolate: false,
        maxConcurrency: 20,
        open: false,
        // pool: 'vmThreads',
        // poolOptions: { threads: { singleThread: true } },
        setupFiles: ['./tests/setup.ts'],
        // resolveSnapshotPath: (testPath, snapshotExtension) =>
        //   testPath.replace(/\.test\.(ts|tsx)$/, `.snap${snapshotExtension}`),
        typecheck: {
          checker: 'tsc',
          enabled: false, // this is already handled by the linter
          // enabled: process.env.CI === 'true',
          include: ['./tests/**/*.{ts,tsx}'],
          tsconfig: './tsconfig.test.json',
        },
        // Enable browser mode
        browser: {
          enabled: true,
          headless: true,

          name: 'chromium',
          // Make sure to install Playwright
          provider: 'playwright',
        },

        // workspace: [
        //   // matches every folder and file inside the `packages` folder
        //   'packages/*',
        //   {
        //     // add "extends: true" to inherit the options from the root config
        //     extends: true,
        //     test: {
        //       include: ['tests/**/*.{browser}.test.{ts,js}'],
        //       // it is recommended to define a name when using inline configs
        //       name: 'happy-dom',
        //       environment: 'happy-dom',
        //     }
        //   },
        //   {
        //     test: {
        //       include: ['tests/**/*.{node}.test.{ts,js}'],
        //       name: 'node',
        //       environment: 'node',
        //     }
        //   }
        // ]
      },
    })
  )
);
