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
      // we still use portable stories for integration tests
      // we might want to rethink this, because this causes redundant work,
      // there is also a benefit of using portable stories, because they cover the same surface, and are faster during ci runs

      // there is an RFC for storybook allowing tests to be written in the same file as the story, so we could consider moving certain things to there if it makes sense to test in a browser environment.
      setupFiles: ['./tests/setup.storybook.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      environment: 'node',
      include: ['**/*.unit.test.{ts,tsx}'],
      name: 'unit',
      setupFiles: ['./tests/setup.node.ts'],
    },
  },
]);
