import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { MdAdd } from 'react-icons/md';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { IconButton } from './IconButton';

const Template = (args: React.ComponentProps<typeof IconButton>) => (
  <IconButton {...args}>
    <MdAdd size={28} />
  </IconButton>
);

const meta: Meta<typeof IconButton> = {
  args: { onClick: fn() },
  component: IconButton,
  parameters: { layout: 'centered' },
  render: Template,
  tags: ['autodocs'],
  title: 'Common/IconButton',
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
  const button = canvas.getByRole('button');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};

export const Light: Story = {
  decorators: [ThemeDecorator({ forceColorScheme: 'light' })],
};

export const Dark: Story = {
  decorators: [ThemeDecorator({ forceColorScheme: 'dark' })],
};

export const Disabled: Story = {
  args: { disabled: true },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};
