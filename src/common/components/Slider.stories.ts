import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  component: Slider,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Slider',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    getValue: () => 50,
    onChange: (value) => console.log(value),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const WithMinMax: Story = {
  args: {
    getValue: () => 75,
    max: 100,
    min: 0,
    onChange: (value) => console.log(value),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    getValue: () => 30,
    onChange: (value) => console.log(value),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};
