import type { Preview } from '@storybook/react';
import "@mantine/core/styles.css";
import { withMantineThemes } from "storybook-addon-mantine";
import { greenTheme, brandTheme } from "../src/themes";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

};

export const decorators = [
  withMantineThemes({
    themes: [
      {
        id: "brand-theme",
        name: "Brand Theme",
        ...brandTheme,
      },
      {
        id: "light-green",
        name: "Light Green Theme",
        ...greenTheme,
      },
    ],
  }),
];

export default preview;
