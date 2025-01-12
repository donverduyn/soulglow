import * as React from 'react';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  Stories,
} from '@storybook/blocks';
import { DOCS_PREPARED } from '@storybook/core-events';
import { addons } from '@storybook/preview-api';
import type { Decorator, Preview } from '@storybook/react';
import { themes, type ThemeVars, ensure } from '@storybook/theming';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '@mantine/core/styles.layer.css';
import { DocsContainer } from './components/DocsContainer';
import 'index.css';
import 'font.css';
import { BodyClassColorSchemeDecorator } from './decorators/ColorSchemeDecorator';
import { I18nDecorator } from './decorators/I18nDecorator';

if (import.meta.env.DEV) {
  // initialize MSW only in development
  initialize({ });
}

export const decorators: Decorator[] = [
  BodyClassColorSchemeDecorator,
  I18nDecorator,
];

const channel = addons.getChannel();

channel.on(DOCS_PREPARED, (payload) => {
  console.log('DOCS_PREPARED', payload);
});

// channel.on(DOCS_PREPARED, (payload) => {
//   console.log('DOCS_PREPARED', payload);
// });

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
    backgrounds: { value: undefined },
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
