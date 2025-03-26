import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import { theme } from 'config/theme';
import { createEndpoint } from 'models/endpoint/Endpoint';
import { AppRuntime } from 'modules/App/context';
import { EndpointListItem } from './EndpointListItem';

const meta: Meta<typeof EndpointListItem> = {
  component: EndpointListItem,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'EndpointPanel/EndpointListItem',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  // globals: { backgrounds: { disabled: true } },
  // parameters: { docs: { canvas: { sourceState: 'shown' } } },
};

export const Dark: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'dark', theme })],
  // globals: { backgrounds: { value: 'dark' } },
};

export const Light: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'light', theme })],
  // globals: { backgrounds: { value: 'light' } },
};

export const HotPink: Story = {
  args: { endpoint: createEndpoint() },
  decorators: [ThemeDecorator({ forceColorScheme: 'dark', theme })],
  globals: { backgrounds: { value: 'hotpink' } },
};

// Light.play = async ({ canvasElement, loaded }) => {
//   const { i18n } = loaded as { i18n: i18n };
//   const canvas = within(canvasElement);
//   const text = i18n.t('addEndpointLabel');
//   const button = canvas.getByText(text);
//   await userEvent.click(button);
//   await expect(button).toBeInTheDocument();
// };
