import * as React from 'react';
import {
  DocsContainer as BaseContainer,
  DocsContainerProps,
} from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { themes } from '@storybook/theming';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

const channel = addons.getChannel();
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

  const theme = React.useMemo(
    () => ({
      ...(isDark ? themes.dark : themes.light),
      fontBase: 'Proxima Nova',
    }),
    [isDark]
  );

  React.useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  return (
    //     <MDXProvider
    //       components={
    //         {
    //           h1: Title.withProps({ order: 1 }),
    //           h2: Title.withProps({ order: 2 }),
    //           h3: Title.withProps({ order: 3 }),
    //           h4: Title.withProps({ order: 4 }),
    //           h5: Title.withProps({ order: 5 }),
    //           h6: Title.withProps({ order: 6 }),
    //           li: List.Item,
    //           p: Text.withProps({ size: 'sm' }),
    //           span: Text.withProps({ size: 'sm' }),
    //           ul: List,
    //         } as Record<string, React.ComponentType>
    //       }
    //     >
    <BaseContainer
      context={context}
      theme={theme}
    >
      {children}
    </BaseContainer>
    //     </MDXProvider>
  );
};
