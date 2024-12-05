import * as React from 'react';
import {
  DEFAULT_THEME,
  MantineProvider,
  type MantineThemeOverride,
} from '@mantine/core';

interface Props extends React.ComponentProps<typeof MantineProvider> {
  readonly children: React.ReactNode;
  readonly defaultColorScheme?: 'light' | 'dark';
  readonly prefix?: string;
  readonly theme?: MantineThemeOverride;
}

export const ThemeProvider: React.FC<Props> = ({
  children,
  defaultColorScheme = 'dark',
  prefix = 'mantine',
  theme = DEFAULT_THEME,
  ...props
}) => (
  <MantineProvider
    classNamesPrefix={prefix}
    defaultColorScheme={defaultColorScheme}
    theme={theme}
    {...props}
  >
    {children}
  </MantineProvider>
);
