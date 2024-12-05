import * as React from 'react';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  Stories,
} from '@storybook/blocks';
import type { Decorator, Preview } from '@storybook/react';
import { themes, type ThemeVars, ensure } from '@storybook/theming';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '@mantine/core/styles.layer.css';
import { DocsContainer } from './components/DocsContainer';
import 'index.css';
import 'font.css';
import { I18nDecorator } from './decorators/I18nDecorator';
import { SbColorSchemeDecorator } from './decorators/SbColorSchemeDecorator';

if (import.meta.env.DEV) {
  // initialize MSW only in development
  initialize({ onUnhandledRequest: 'bypass', quiet: true });
}

export const decorators: Decorator[] = [SbColorSchemeDecorator, I18nDecorator];

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
          { right: '🇺🇸', title: 'English', value: 'en' },
          { right: '🇳🇱', title: 'Dutch', value: 'nl' },
        ],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
  loaders: import.meta.env.DEV ? [mswLoader] : [],
  parameters: {
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
      dark: {
        ...themes.dark,
        appBg: '#1b1c1d',
        // appBorderRadius: 20,
        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
      light: {
        ...themes.normal,
        // appBg: 'red',
        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
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
      theme: ensure({ ...themes.dark, fontBase: 'Proxima Nova' }),
      toc: { disable: false },
    },
  },
};

export default preview;
