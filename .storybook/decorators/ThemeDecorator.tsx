import * as React from 'react';
import createCache from '@emotion/cache';
import type { PropsOf } from '@emotion/react';
import type { Decorator } from '@storybook/react';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { getEmotionCacheConfig } from 'config/emotion';
import { theme as mantineTheme } from 'config/theme';

// TODO: find the right place to couple the config to the storybook specific implementation. Maybe on the story level by just passing it in, which would make it more explicit to future readers.

const emotionCache = createCache(getEmotionCacheConfig(prefix));

export const ThemeDecorator = (
  props: Partial<PropsOf<typeof ThemeProvider>> = {}
) => {
  const ThemeDecorator: Decorator = (Story, { canvasElement }) => {
    const getRootElement = React.useCallback(
      () => canvasElement,
      [canvasElement]
    );
    return (
      <ThemeProvider
        cssVariablesSelector={`#${canvasElement.id}`}
        emotionCache={emotionCache}
        getRootElement={getRootElement}
        prefix={prefix}
        theme={mantineTheme}
        {...props}
      >
        <Story />
      </ThemeProvider>
    );
  };
  return ThemeDecorator;
};
