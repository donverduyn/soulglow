import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import type { ExtendArgs } from '.storybook/utils/args';
import { AppRuntime } from 'modules/App/context';
import { LightBulb } from './LightBulb';

const meta: Meta<ExtendArgs<typeof LightBulb>> = {
  argTypes: {
    labels: { table: { disable: true } },
  },
  args: { labels: LightBulb.labels },
  component: LightBulb,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: '@LightBulb/LightBulb',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
};
