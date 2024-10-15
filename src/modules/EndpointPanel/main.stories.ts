import type { Meta, StoryObj } from '@storybook/react';
import type { Simplify } from 'type-fest';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import EndpointPanel from './main';

type Foo = Simplify<typeof AppTags>;

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
