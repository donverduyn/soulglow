import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { createState } from '.storybook/utils/createState';
import { NumberInput } from './NumberInput';

const [getValue, onChange] = createState(10);

const meta: Meta<typeof NumberInput> = {
  args: { getValue, onChange },
  component: NumberInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/NumberInput',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

export const Light: Story = {
  decorators: [ThemeDecorator({ forceColorScheme: 'light' })],
};

export const Dark: Story = {
  decorators: [ThemeDecorator({ forceColorScheme: 'dark' })],
};

export const Disabled: Story = {
  args: { disabled: true },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};
