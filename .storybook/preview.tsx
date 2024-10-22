import * as React from 'react';
import createCache from '@emotion/cache';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  Stories,
  ColorPalette,
} from '@storybook/blocks';
import type { Decorator, Preview } from '@storybook/react';
import { themes, type ThemeVars, ensure } from '@storybook/theming';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { getEmotionCacheConfig } from 'config/emotion';
import { theme } from 'config/theme';
import { initializeI18N } from '../src/i18n';
import { ColorSchemeWrapper } from './components/ColorSchemeWrapper';
import { DocsContainer } from './components/DocsContainer';
import '@mantine/core/styles.css';
import 'index.css';
import 'font.css';

// import { addons } from "@storybook/addons";
// import { UPDATE_GLOBALS, STORY_ARGS_UPDATED } from "@storybook/core-events";

const i18n = initializeI18N();
if (import.meta.env.DEV) {
  // initialize MSW only in development
  initialize({ quiet: true });
}

const emotionCache = createCache(getEmotionCacheConfig(prefix));

const decorators: Decorator[] = [
  (render) => <ColorSchemeWrapper>{render()}</ColorSchemeWrapper>,
  (render) => (
    <ThemeProvider
      emotionCache={emotionCache}
      prefix={prefix}
      theme={theme}
    >
      {render()}
    </ThemeProvider>
  ),
  (render, context) => {
    const { locale } = context.globals as { locale: string };
    React.useEffect(() => {
      void i18n.changeLanguage(locale);
    }, [locale]);
    return <I18nextProvider i18n={i18n}>{render()}</I18nextProvider>;
  },
];

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
        dark: { name: 'Dark', value: '#333' },
        hotpink: { name: 'Hotpink', value: 'hotpink' },
        light: { name: 'Light', value: '#F7F9F2' },
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

        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
      light: {
        ...themes.normal,
        // appBg: 'red',
        fontBase: 'Proxima Nova',
      } satisfies ThemeVars,
    },
    docs: {
      // source: {
      //   dark: false,
      // },
      canvas: {
        sourceState: 'shown',
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
            <ColorPalette />
            <Stories />
          </>
        );
      },
      source: { dark: false, state: 'open' },
      theme: Object.assign(
        ensure({ ...themes.dark, fontBase: 'Proxima Nova' }),
        {
          typography: { fonts: { weight: { regular: 600 } } },
        }
      ),
      toc: {
        disable: false,
        headingSelector: 'h2, h3',
        // ignoreSelector: '.docs-story h2, .docs-story h3',
      },
    },
  },
};

export default preview;
