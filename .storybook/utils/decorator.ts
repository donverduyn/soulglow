import * as React from 'react';
import type { Decorator } from '@storybook/react';

export const createDecorator =
  <R>(factory: (...args: Parameters<Decorator>) => R): Decorator =>
  (Story, ...args): R => {
    const StoryMemo = React.useMemo(() => Story, [Story]);
    return factory(StoryMemo, ...args);
  };
