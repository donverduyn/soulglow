import * as React from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

export const getScheme = (isDark: boolean) => (isDark ? 'dark' : 'light');

export const useDarkModeEvent = (handler: (isDark: boolean) => void) => {
  React.useEffect(() => {
    const channel = addons.getChannel();
    channel.on(DARK_MODE_EVENT_NAME, handler);
    return () => channel.off(DARK_MODE_EVENT_NAME, handler);
  }, [handler]);
};
