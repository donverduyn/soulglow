import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/NumberInput',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Default NumberInput' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Primary: Story = {
  args: { children: 'Primary NumberInput', variant: 'primary' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Secondary: Story = {
  args: { children: 'Secondary NumberInput', variant: 'secondary' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Disabled: Story = {
  args: { children: 'Disabled NumberInput', disabled: true },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
};
