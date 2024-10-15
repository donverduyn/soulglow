import type { Meta, StoryObj } from '@storybook/react';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from './main';

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps
const Component = WithRuntime(AppRuntime)(EndpointPanel);

const meta = {
  argTypes: {},
  component: Component,
  parameters: { layout: 'centered' },
  play: async () => Promise.resolve(),
  title: '@EndpointPanel/Main',
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
