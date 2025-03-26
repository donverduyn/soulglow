import * as React from 'react';
import {
  Title,
  Subtitle,
  Description,
  Controls,
  Stories,
} from '@storybook/blocks';
import type { Preview } from '@storybook/react';
import { themes, type ThemeVars, ensure } from '@storybook/theming';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { Primary } from './blocks/Primary';
import '@mantine/core/styles.layer.css';
import { DocsContainer } from './components/DocsContainer';
import '../src/index.css';
import '../src/font.css';
// import { BodyClassColorSchemeDecorator } from './decorators/ColorSchemeDecorator';
import { I18nDecorator } from './decorators/I18nDecorator';
import { I18nLoader } from './loaders/I18nLoader';

if (import.meta.env.DEV) {
  // initialize MSW only in development
  initialize({ onUnhandledRequest: 'bypass', quiet: true });
}

// polyfill for babel parser
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as typeof window.process;
}

export const decorators = [I18nDecorator]; //, BodyClassColorSchemeDecorator];

const preview: Preview = {
  decorators,
  globalTypes: {
    locale: {
      defaultValue: 'en',
      description: 'Internationalization locale',
      name: 'Locale',
      toolbar: {
        icon: 'globe',
        items: [
          { right: '🇺🇸', title: 'CI', value: 'cimode' },
          { right: '🇺🇸', title: 'English', value: 'en' },
          { right: '🇳🇱', title: 'Dutch', value: 'nl' },
        ],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: undefined },
  },
  // we only use MSW in our test environment, which is not part of the build
  loaders: import.meta.env.DEV ? [mswLoader, I18nLoader] : [I18nLoader],
  parameters: {
    a11y: { test: 'error' },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#2b2b2b' },
        hotpink: { name: 'Hotpink', value: 'hotpink' },
        light: { name: 'Light', value: '#fff' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      classTarget: 'body',
      dark: {
        ...themes.dark,
        appBg: '#1b1c1d',
        // appBorderRadius: 20,
        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
      darkClass: 'dark',
      light: {
        ...themes.normal,
        // appBg: 'red',
        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
      lightClass: 'light',
      stylePreview: true,
    },
    docs: {
      canvas: {
        // sourceState: 'shown',
      },
      container: DocsContainer,
      page: function Page() {
        return (
          <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <Controls />
            <Stories includePrimary={false} />
          </>
        );
      },
      source: { state: 'open' },
      story: {
        autoplay: true,
      },
      // story: { inline: false },
      theme: ensure({ ...themes.dark, fontBase: 'Proxima Nova' }),
      toc: { disable: false },
    },
    options: {
      storySort: {
        order: [
          '*',
          'Common',
          // 'Intro',
          // 'Pages',
          // ['Home', 'Login', 'Admin'],
          // 'Components',
          // '*',
          // 'WIP',
        ],
      },
    },
  },
};

export default preview;
