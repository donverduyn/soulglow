import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/App.runtime';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
    test: { skip: true },
  },
  tags: ['autodocs'],
  title: 'Common/Select',
};

export default meta;
type Story = StoryObj<React.ComponentProps<typeof Select>>;

const items = [
  { id: '1', label: 'Option 1', value: 'option1' },
  { id: '2', label: 'Option 2', value: 'option2' },
  { id: '3', label: 'Option 3', value: 'option3' },
];

export const Default: Story = {
  args: {
    getValue: () => 'option1',
    items,
    label: 'Default Select',
    name: 'default-select',
    onChange: (value) => console.log(value),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const WithPlaceholder: Story = {
  args: {
    getValue: () => '',
    items,
    label: 'Select with Placeholder',
    name: 'placeholder-select',
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
    getValue: () => 'option1',
    items,
    label: 'Disabled Select',
    name: 'disabled-select',
    onChange: (value) => console.log(value),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'light' }),
  ],
  globals: { backgrounds: { disabled: true } },
};
