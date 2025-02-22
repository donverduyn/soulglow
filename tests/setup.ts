import { setProjectAnnotations } from '@storybook/react';
import { render, cleanup } from '@testing-library/react';
import { getWorker } from 'msw-storybook-addon';
import { vi } from 'vitest';
import previewAnnotations from '.storybook/preview';
import '@testing-library/jest-dom/vitest';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';

const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  previewAnnotations,
  { testingLibraryRender: render },
]);

/* eslint-disable vitest/require-top-level-describe */
// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);

const worker = getWorker();
afterEach(() => {
  worker.resetHandlers();
  vi.restoreAllMocks();
  vi.resetModules();
  cleanup();
});

/* eslint-enable vitest/require-top-level-describe */
// because uuid is not tree-shakeable with cjs
vi.mock('uuid', () => ({ v4: () => crypto.randomUUID() }));
