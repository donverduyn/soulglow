import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  component: Radio,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Radio',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    getValue: () => false,
    name: 'default-radio',
    onChange: () => {},
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Checked: Story = {
  args: {
    getValue: () => true,
    name: 'checked-radio',
    onChange: () => {},
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
    getValue: () => false,
    name: 'disabled-radio',
    onChange: () => {},
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};
