import * as React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { addons } from '@storybook/preview-api';
import { Decorator } from '@storybook/react';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

interface Props {
  readonly children: React.ReactNode;
}

const channel = addons.getChannel();
const Component: React.FC<Props> = ({ children }) => {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = React.useCallback(
    (value: boolean) => setColorScheme(value ? 'dark' : 'light'),
    [setColorScheme]
  );

  React.useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, handleColorScheme]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export const ColorSchemeDecorator: Decorator = (Story) => {
  const Children = React.memo(Story);
  return (
    <Component>
      <Children />
    </Component>
  );
};
