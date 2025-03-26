import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // storybook runs smoke tests and play tests in chromium
  '.storybook/vitest.config.ts',
  {
    extends: './vitest.config.ts',
    test: {
      environment: 'happy-dom',
      include: ['**/*.integration.test.{ts,tsx}'],
      name: 'integration',
      // we still use portable stories for integration tests, so we use setup.storybook.ts instead of setup.react.ts
      setupFiles: ['./tests/setup.storybook.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      environment: 'node',
      exclude: ['**/*.integration.test.*', '**/*.e2e.test.*'],
      include: ['**/*.test.{ts,tsx}'],
      name: 'unit',
      setupFiles: ['./tests/setup.node.ts'],
    },
  },
]);
