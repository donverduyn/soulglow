import * as React from 'react';
import { type MantineThemeOverride } from '@mantine/core';
import type { Decorator } from '@storybook/react';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { theme as mantineTheme } from 'config/theme';

// TODO: find the right place to couple the config to the storybook specific implementation. Maybe on the story level by just passing it in, which would make it more explicit to future readers.

const getAnchor = (document: Document, id: string) => () =>
  document.getElementById(`anchor--${id}`) ?? document.documentElement;

const getVariablesSelector = (document: Document, id: string) =>
  document.getElementById(`anchor--${id}`) ? `#anchor--${id}` : ':root';

export const ThemeDecorator = ({
  theme,
  ...props
}: Partial<React.ComponentProps<typeof ThemeProvider>> = {}) => {
  const ThemeDecorator: Decorator = (Story, { id }) => {
    const Children = React.memo(Story);
    return (
      <ThemeProvider
        cssVariablesSelector={getVariablesSelector(document, id)}
        getRootElement={getAnchor(document, id)}
        prefix={prefix}
        theme={theme ?? mantineTheme}
        {...props}
      >
        <Children />
      </ThemeProvider>
    );
  };
  return ThemeDecorator;
};
