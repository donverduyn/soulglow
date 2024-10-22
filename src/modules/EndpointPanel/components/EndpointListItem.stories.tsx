import type { PropsOf } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import { EndpointListItem } from './EndpointListItem';

const Component = WithRuntime(AppRuntime)(EndpointListItem);

const meta: Meta<typeof EndpointListItem> = {
  component: EndpointListItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'EndpointPanel/EndpointListItem',
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args: PropsOf<typeof Component>) => <Component {...args} />;

export const Default: Story = {
  args: { endpoint: createEndpoint() },
  render: Template,
};

export const Inactive: Story = {
  args: {
    endpoint: createEndpoint(),
  },
  globals: {
    backgrounds: { value: 'light' },
  },
  render: Template,
};

export const ErrorState: Story = {
  args: {
    endpoint: createEndpoint(),
  },
  globals: {
    backgrounds: { value: 'hotpink' },
  },
  // parameters: {
  //   backgrounds: {
  //     disable: true,
  //     default: 'twitter',
  //     values: [
  //       { name: 'twitter', value: '#00aced' },
  //       { name: 'facebook', value: '#3b5998' },
  //     ],
  //   },
  // },
  render: Template,
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByText('Add Endpoint');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};
