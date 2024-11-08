import * as React from 'react';
import createCache from '@emotion/cache';
import type { PropsOf } from '@emotion/react';
import { mergeThemeOverrides, type MantineThemeOverride } from '@mantine/core';
import type { Decorator } from '@storybook/react';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { getEmotionCacheConfig } from 'config/emotion';
import { theme as mantineTheme } from 'config/theme';

// TODO: find the right place to couple the config to the storybook specific implementation. Maybe on the story level by just passing it in, which would make it more explicit to future readers.

const emotionCache = createCache(getEmotionCacheConfig(prefix));

export const ThemeDecorator = (
  props: Partial<PropsOf<typeof ThemeProvider>> & {
    theme?: Partial<MantineThemeOverride>;
  } = {}
) => {
  const ThemeDecorator: Decorator = (Story, { id, viewMode }) => {
    const Children = React.memo(Story);
    if (viewMode === 'docs') {
      document.documentElement.removeAttribute('data-mantine-color-scheme');
    }
    const element =
      document.getElementById(`anchor--${id}`) ?? document.documentElement;
    const getRootElement = React.useCallback(() => element, [element]);

    return (
      <ThemeProvider
        emotionCache={emotionCache}
        getRootElement={getRootElement}
        prefix={prefix}
        cssVariablesSelector={
          element === document.documentElement ? ':root' : `#anchor--${id}`
        }
        theme={
          props.theme
            ? mergeThemeOverrides(props.theme, mantineTheme)
            : mantineTheme
        }
        {...props}
      >
        <Children />
      </ThemeProvider>
    );
  };
  return ThemeDecorator;
};
