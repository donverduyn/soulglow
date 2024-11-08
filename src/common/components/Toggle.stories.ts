import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Toggle',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    getValue: () => false,
    name: 'default-toggle',
    onChange: (value) => console.log(value),
  },
};

export const Checked: Story = {
  args: {
    getValue: () => true,
    name: 'checked-toggle',
    onChange: (value) => console.log(value),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    getValue: () => false,
    name: 'disabled-toggle',
    onChange: (value) => console.log(value),
  },
};
