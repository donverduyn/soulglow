import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: { provider: 'v8', reporter: 'html' },
    css: false,
    deps: { optimizer: { web: { enabled: true } } },
    environment: 'happy-dom',
    globals: true,
    isolate: false,
    maxConcurrency: 20,
    open: false,
    // pool: 'vmThreads',
    // poolOptions: { threads: { singleThread: true } },
    // setupFiles: ['./tests/setup.ts'],
    // resolveSnapshotPath: (testPath, snapshotExtension) =>
    //   testPath.replace(/\.test\.(ts|tsx)$/, `.snap${snapshotExtension}`),
    typecheck: {
      checker: 'tsc',
      enabled: false, // this is already handled by the linter
      // enabled: process.env.CI === 'true',
      include: ['./tests/**/*.{ts,tsx}'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
