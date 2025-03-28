import type { StoryContext } from '@storybook/react';

const isDev = process.env.NODE_ENV === 'development';

export const prettierForSourceInDev = () => {
  return {
    canvas: isDev ? {} : { sourceState: 'none' },
    source: isDev
      ? {
          transform: async (code: string, storyContext: StoryContext) => {
            const { unwrapAndFixMemoJSX } = await import('./source');
            return unwrapAndFixMemoJSX(code, storyContext);
          },
        }
      : { sourceShown: null },
  };
};
