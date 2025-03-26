import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  // decorators: [RuntimeDecorator(AppRuntime)],
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Common/Text',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Text',
  },
};

export const WithCustomVariant: Story = {
  args: {
    children: 'Text with Custom Variant',
    variant: 'h1',
  },
};

export const WithCustomClassName: Story = {
  args: {
    children: 'Text with Custom ClassName',
    className: 'custom-class',
  },
};
