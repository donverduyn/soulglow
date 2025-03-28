// import { mergeThemeOverrides, DEFAULT_THEME } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/App.runtime';
// import { theme } from 'config/theme';
import { Paper } from './Paper';

const meta: Meta<typeof Paper> = {
  component: Paper,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Common/Paper',
};

export default meta;
type Story = StoryObj<typeof Paper>;

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
