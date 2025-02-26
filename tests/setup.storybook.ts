// since storybook 8.6
// eslint-disable-next-line import/namespace
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react';
import { render, cleanup } from '@testing-library/react';
import { getWorker } from 'msw-storybook-addon';
import { vi } from 'vitest';
import previewAnnotations from '.storybook/preview';
import './setup.react';

const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  previewAnnotations,
  { testingLibraryRender: render },
]);

// Run Storybook's beforeAll hook
// eslint-disable-next-line vitest/require-top-level-describe
beforeAll(annotations.beforeAll);

const worker = getWorker();
// eslint-disable-next-line vitest/require-top-level-describe
afterEach(() => {
  worker.resetHandlers();
  vi.restoreAllMocks();
  vi.resetModules();
  cleanup();
});
