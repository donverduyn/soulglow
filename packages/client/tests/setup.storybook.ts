// since storybook 8.6
// eslint-disable-next-line import/namespace
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
// eslint-disable-next-line import/order
import { setProjectAnnotations } from '@storybook/react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error not allowed
process.env.RTL_SKIP_AUTO_CLEANUP = true;

import { cleanup, render } from '@testing-library/react';
// import '@testing-library/react/dont-cleanup-after-each';
import { getWorker } from 'msw-storybook-addon';
import { beforeAll, beforeEach, afterEach, vi } from 'vitest';
import previewAnnotations from '_storybook/preview';
import './setup.react';

const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  previewAnnotations,
  {
    // experiment with injecting Vitest's interactivity API over our userEvent while tests run in browser mode
    // https://vitest.dev/guide/browser/interactivity-api.html
    // loaders: async (context) => {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-expect-error not allowed
    //   if (globalThis.__vitest_browser__) {
    //     const vitest = await import('@vitest/browser/context');
    //     const { userEvent: browserEvent } = vitest;
    //     context.userEvent = browserEvent.setup();
    //     context.expect = vitestExpect;
    //   } else {
    //     context.userEvent = storybookEvent.setup();
    //     context.expect = storybookExpect;
    //   }
    // },
  },
  { testingLibraryRender: render },
]);

// Run Storybook's beforeAll hook
// eslint-disable-next-line vitest/require-top-level-describe
beforeAll(annotations.beforeAll);

const worker = getWorker();
// eslint-disable-next-line vitest/require-top-level-describe
beforeEach(() => {
  cleanup();
});
// eslint-disable-next-line vitest/require-top-level-describe
afterEach(() => {
  worker.resetHandlers();
  vi.restoreAllMocks();
  vi.resetModules();
});
