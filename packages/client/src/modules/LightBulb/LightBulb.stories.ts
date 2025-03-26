import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import type { ExtendArgs } from '_storybook/utils/args';
import { AppRuntime } from 'modules/App/context';
import { LightBulb } from './LightBulb';

const meta: Meta<ExtendArgs<typeof LightBulb>> = {
  argTypes: {
    labels: { table: { disable: true } },
  },
  args: {
    getStyle: () => ({
      // background: 'cyan',
    }),
    labels: LightBulb.labels,
    onChange: fn(),
  },
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
