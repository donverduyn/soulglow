import * as React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { Decorator } from '@storybook/react';
import { flow } from 'effect';
import { useDarkModeEvent, getScheme } from '_storybook/hooks/useDarkModeEvent';
import { createDecorator } from '_storybook/utils/decorator';

/*
 * Adds an html attribute to the html tag named "mantine-data-color-scheme",
 * with the value "dark" or "light" based on the value of the dark mode event,
 * which is toggled by the user.
 */

export const ColorSchemeDecorator: Decorator = createDecorator((Story) => {
  const { setColorScheme } = useMantineColorScheme();

  // the actual place where its set depends on the story and ThemeDecorator
  useDarkModeEvent(flow(getScheme, setColorScheme));
  return <Story />;
});

/*
 * Adds a class to the body tag named "dark" or "light",
 * based on the value of the dark mode event, which is toggled by the user.
 */

// const setBodyColorScheme = memoize(
//   (document: Document) => (isDark: boolean) => {
//     document.body.classList.toggle('dark', isDark);
//     document.body.classList.toggle('light', !isDark);
//   }
// );

// export const BodyClassColorSchemeDecorator = createDecorator((Story) => {
//   useDarkModeEvent(setBodyColorScheme(document));
//   return <Story />;
// });
