import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  component: Slider,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Common/Slider',
};

export default meta;
type Story = StoryObj<React.ComponentProps<typeof Slider>>;

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
