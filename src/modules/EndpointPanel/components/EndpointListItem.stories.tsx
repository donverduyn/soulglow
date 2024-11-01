import type { PropsOf } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import { EndpointListItem } from './EndpointListItem';

const meta: Meta<typeof EndpointListItem> = {
  component: EndpointListItem,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    docs: {
      // page: function Page() {
      //   return (
      //     <>
      //       <Title />
      //       <Subtitle />
      //       <Description />
      //       <Primary />
      //       <Controls />
      //       <ColorPalette />
      //       <Stories />
      //     </>
      //   );
      // },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'EndpointPanel/EndpointListItem',
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args: PropsOf<typeof EndpointListItem>) => (
  <EndpointListItem {...args} />
);

export const Dark: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'dark' })],
  globals: { backgrounds: { value: 'dark' } },
  parameters: { docs: { canvas: { sourceState: 'hidden' } } },
  render: Template,
};

export const Light: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'light' })],
  globals: { backgrounds: { value: 'light' } },
  // TODO: set this on the stories docblock level
  parameters: { docs: { canvas: { sourceState: 'hidden' } } },
  render: Template,
};

export const HotPink: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'dark' })],
  globals: { backgrounds: { value: 'hotpink' } },
  parameters: { docs: { canvas: { sourceState: 'hidden' } } },
  render: Template,
};

Light.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByText('Add Endpoint');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};
