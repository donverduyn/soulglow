import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Text',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Text',
  },
};

export const WithCustomVariant: Story = {
  args: {
    children: 'Text with Custom Variant',
    variant: 'h1',
  },
};

export const WithCustomClassName: Story = {
  args: {
    children: 'Text with Custom ClassName',
    className: 'custom-class',
  },
};
