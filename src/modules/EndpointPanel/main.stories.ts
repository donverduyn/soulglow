import type { Meta, StoryObj } from '@storybook/react';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from './main';

const Component = WithRuntime(AppRuntime)(EndpointPanel);

const meta = {
  argTypes: {},
  component: Component,
  parameters: { layout: 'top' },
  title: '@EndpointPanel/Main',
  // args: { publish: fn() },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
