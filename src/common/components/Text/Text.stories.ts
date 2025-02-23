import type { Meta, StoryObj } from '@storybook/react';
import { AppRuntime } from 'modules/App/context';
import { Text } from './Text';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';



const meta: Meta<typeof Text> = {
  component: Text,
  // decorators: [RuntimeDecorator(AppRuntime)],
    decorators: [
      ColorSchemeDecorator,
      ThemeDecorator({ defaultColorScheme: 'light' }),
    ],
  parameters: { layout: 'centered' },
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
