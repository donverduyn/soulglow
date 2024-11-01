import * as React from 'react';
import { CacheProvider, type EmotionCache, type PropsOf } from '@emotion/react';
import {
  DEFAULT_THEME,
  MantineProvider,
  type MantineThemeOverride,
} from '@mantine/core';
import { emotionTransform, MantineEmotionProvider } from '@mantine/emotion';

interface Props extends PropsOf<typeof MantineProvider> {
  readonly children: React.ReactNode;
  readonly defaultColorScheme?: 'light' | 'dark';
  readonly emotionCache: EmotionCache;
  readonly prefix?: string;
  readonly theme?: MantineThemeOverride;
}

export const ThemeProvider: React.FC<Props> = ({
  children,
  defaultColorScheme = 'dark',
  emotionCache,
  prefix = 'mantine',
  theme = DEFAULT_THEME,
  ...props
}) => (
  <CacheProvider value={emotionCache}>
    <MantineEmotionProvider>
      <MantineProvider
        classNamesPrefix={prefix}
        defaultColorScheme={defaultColorScheme}
        stylesTransform={emotionTransform}
        theme={theme}
        {...props}
      >
        {children}
      </MantineProvider>
    </MantineEmotionProvider>
  </CacheProvider>
);
