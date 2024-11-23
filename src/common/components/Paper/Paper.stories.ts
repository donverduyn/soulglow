// import { mergeThemeOverrides, DEFAULT_THEME } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
// import { theme } from 'config/theme';
import { AppRuntime } from 'modules/App/context';
import { Paper } from './Paper';

const meta: Meta<typeof Paper> = {
  component: Paper,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Paper',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    getStyle: (theme) => ({
      backgroundColor: 'gray',
      padding: theme.spacing.md,
    }),
    render: () => 'Default Paper',
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const text = canvas.getByText('Default Paper');
  const bgStyle = text.style.getPropertyValue('background-color');
  // const t = mergeThemeOverrides(DEFAULT_THEME, theme);
  await expect(bgStyle).toBe('gray');
  await expect(text).toBeInTheDocument();
};
