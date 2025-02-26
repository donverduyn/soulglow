import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { createState } from '.storybook/utils/createState';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Common/TextInput',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: (() => {
    const [getValue, onChange] = createState('Default Value');
    return { getValue, onChange };
  })(),
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

export const WithPlaceholder: Story = {
  args: (() => {
    const [getValue, onChange] = createState('');
    return {
      getValue,
      onChange,
      placeholder: 'Enter text...',
    };
  })(),
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

export const Disabled: Story = {
  args: (() => {
    const [getValue, onChange] = createState('Disabled Input');
    return {
      disabled: true,
      getValue,
      onChange,
    };
  })(),
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};
