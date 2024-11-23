import { List as MantineList } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { List } from './List';

const items = ['test', 'test1', 'test2'];

const meta: Meta<typeof List> = {
  args: {
    render: () =>
      items.map((item) => (
        <MantineList.Item key={item}>{item}</MantineList.Item>
      )),
  },
  component: List,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/List',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const li = canvas.getByText('test');
  await expect(li).toBeInTheDocument();
};
