import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/IconButton',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // args: { children: <Icon icon={homeIcon} /> },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
};

export const Primary: Story = {
  // args: { children: <Icon icon={homeIcon} />, color: 'blue' },
};

export const Secondary: Story = {
  // args: { children: <Icon icon={homeIcon} />, color: 'gray' },
};

export const Disabled: Story = {
  // args: { children: <Icon icon={homeIcon} />, disabled: true },
};

export const Clickable: Story = {
  args: {
    // children: <Icon icon={homeIcon} />,
    onClick: () => alert('IconButton clicked!'),
  },
};

Clickable.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};
