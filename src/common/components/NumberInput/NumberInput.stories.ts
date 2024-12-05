import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { createState } from '.storybook/utils/createState';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/NumberInput',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: (() => {
    const [getValue, onChange] = createState(10);
    return { getValue, onChange };
  })(),
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

export const Light: Story = {
  args: (() => {
    const [getValue, onChange] = createState(10);
    return { getValue, onChange };
  })(),
  decorators: [ThemeDecorator({ forceColorScheme: 'light' })],
};

export const Dark: Story = {
  args: (() => {
    const [getValue, onChange] = createState(10);
    return { getValue, onChange };
  })(),
  decorators: [ThemeDecorator({ forceColorScheme: 'dark' })],
};

export const Disabled: Story = {
  args: (() => {
    const [getValue, onChange] = createState(10);
    return { disabled: true, getValue, onChange };
  })(),
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};
