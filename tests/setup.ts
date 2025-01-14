import { setProjectAnnotations } from '@storybook/react';
import { render } from '@testing-library/react';
import { getWorker } from 'msw-storybook-addon';
import { vi } from 'vitest';
import previewAnnotations from '.storybook/preview';
import '@testing-library/jest-dom/vitest';

const annotations = setProjectAnnotations([
  previewAnnotations,
  { testingLibraryRender: render },
]);

/* eslint-disable vitest/require-top-level-describe */
// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);

const worker = getWorker();
afterEach(() => {
  worker.resetHandlers();
});

/* eslint-enable vitest/require-top-level-describe */
// because uuid is not tree-shakeable with cjs
vi.mock('uuid', () => ({ v4: () => crypto.randomUUID() }));
