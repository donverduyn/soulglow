import * as React from 'react';
import type { Decorator } from '@storybook/react';
import { ColorSchemeWrapper } from '../components/ColorSchemeWrapper';

export const ColorSchemeDecorator: Decorator = (Story) => (
  <ColorSchemeWrapper>
    <Story />
  </ColorSchemeWrapper>
);
