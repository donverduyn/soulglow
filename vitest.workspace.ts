import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      environment: 'node',
      exclude: [
        'packages/**',
        'node_modules/**',
        '**/*.integration.test.{ts,tsx}',
        '**/*.e2e.test.{ts,tsx}',
      ],
      include: ['**/*.test.{ts,tsx}'],
      name: 'unit',
      setupFiles: ['./tests/setup.node.ts'],
    },
  },
]);
