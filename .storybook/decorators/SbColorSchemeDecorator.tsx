import * as React from 'react';
import { addons } from '@storybook/preview-api';
import type { Decorator } from '@storybook/react';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

interface Props {
  readonly children: React.ReactNode;
}

const channel = addons.getChannel();

const ColorSchemeWrapper: React.FC<Props> = ({ children }) => {
  const handleColorScheme = React.useCallback((value: boolean) => {
    document.body.classList.toggle('dark', value);
    document.body.classList.toggle('light', !value);
  }, []);

  React.useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [handleColorScheme]);

  return children;
};

export const SbColorSchemeDecorator: Decorator = (Story) => (
  <ColorSchemeWrapper>
    <Story />
  </ColorSchemeWrapper>
);
