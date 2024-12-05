import { Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { MdOutlineDelete } from 'react-icons/md';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { variants } from '.storybook/utils/variants';
import { IconButton } from './IconButton';

const VariantsTemplate = (args: React.ComponentProps<typeof IconButton>) => (
  <Group gap='lg'>
    {variants.map((variant) => (
      <IconButton
        key={variant}
        variant={variant}
        {...args}
      >
        {args.children}
      </IconButton>
    ))}
    <IconButton
      disabled
      {...args}
    >
      {args.children}
    </IconButton>
  </Group>
);

const meta: Meta<typeof IconButton> = {
  argTypes: {
    children: {
      table: { disable: true },
    },
  },
  args: { onClick: fn() },
  component: IconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/IconButton',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <MdOutlineDelete size={28} /> },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};

export const Variants: Story = {
  args: { children: <MdOutlineDelete size={28} />, size: 'xl' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  render: VariantsTemplate,
};

export const VariantsS: Story = {
  args: { children: <MdOutlineDelete size={16} />, size: 'md' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  render: VariantsTemplate,
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};
