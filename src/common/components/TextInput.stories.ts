import type { Meta, StoryObj } from '@storybook/react';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/TextInput',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    getValue: () => 'Default Value',
    onChange: (value) => console.log(value),
  },
};

export const WithPlaceholder: Story = {
  args: {
    getValue: () => '',
    onChange: (value) => console.log(value),
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    getValue: () => 'Disabled Input',
    onChange: (value) => console.log(value),
  },
};
