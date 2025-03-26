import React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { Typeset as SbTypeset } from '@storybook/blocks';
import { flow } from 'effect';
import { useDarkModeEvent, getScheme } from '_storybook/hooks/useDarkModeEvent';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { theme as mantineTheme } from 'config/theme';

const anchorClass = 'docblock-typeset';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withColorScheme = <P extends Record<string, any>>(
  Component: React.FC<P>
) => {
  const Wrapped = ({ children, ...props }: P) => {
    const { setColorScheme } = useMantineColorScheme();
    useDarkModeEvent(flow(getScheme, setColorScheme));
    return <Component {...(props as P)}>{children}</Component>;
  };

  return Wrapped;
};

const Component = withColorScheme(SbTypeset);

// const getAnchor = (document: Document, cls: string) => () =>
//   document.getElementsByClassName(cls)[0] as HTMLElement;

const getVariablesSelector = (cls: string) => `.${cls}`;

export const Typeset: typeof SbTypeset = (props) => {
  return (
    <ThemeProvider
      cssVariablesSelector={getVariablesSelector(anchorClass)}
      prefix={prefix}
      // TODO: find out why --mantine-color-text and --mantine-color-body are not available when the root is changed, while it does work in ThemeDecorator
      // getRootElement={getAnchor(document, anchorClass)}
      theme={mantineTheme}
    >
      <Component {...props} />
    </ThemeProvider>
  );
};

// TODO: instead of coupling mantine to each docblock, we should have a higher order component or decorator component to use in the mdx files
