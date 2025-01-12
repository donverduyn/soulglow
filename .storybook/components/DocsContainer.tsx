import * as React from 'react';
import { MDXProvider } from '@mdx-js/react';
import {
  DocsContainer as BaseContainer,
  DocsContainerProps,
} from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { themes } from '@storybook/theming';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

const channel = addons.getChannel();

type Themes = typeof themes;
const getTheme = (themes: Themes, isDark: boolean) => ({
  ...(isDark ? themes.dark : themes.light),
  fontBase: 'Proxima Nova',
});

const removeColorSchemeFrom = (document: Document) => {
  document.documentElement.removeAttribute('data-mantine-color-scheme');
};

export const DocsContainer: React.FC<
  React.PropsWithChildren<DocsContainerProps>
> = ({ children, context }) => {
  const [isDark, setDark] = React.useState(() => {
    const channel = addons.getChannel();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error data is private
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (channel.data?.DARK_MODE?.[0] as boolean | undefined) ?? false;
  });

  React.useEffect(() => {
    removeColorSchemeFrom(document);
    channel.on(DARK_MODE_EVENT_NAME, setDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  return (
    <MDXProvider>
      <BaseContainer
        context={context}
        theme={getTheme(themes, isDark)}
      >
        {children}
      </BaseContainer>
    </MDXProvider>
  );
};
