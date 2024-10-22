import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import type { Simplify } from 'type-fest';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import EndpointPanel from './main';

type Foo = Simplify<typeof AppTags>;

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps
const 
Component = WithRuntime(AppRuntime)(EndpointPanel);

const meta: Meta<typeof Component> = {
  argTypes: {
    colorTheme: {
      control: { type: 'radio' },
      defaultValue: 'Light',
      options: ['Light', 'Dark'],
    },
  },
  component: Component,
  // subcomponents: { EndpointListItem },
  parameters: { layout: 'centered' },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByText('Add Endpoint');
    await userEvent.click(button);
    await userEvent.click(button);

    await expect(button).toBeInTheDocument();
  },
  tags: ['autodocs'],
  title: '@EndpointPanel/Main',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
