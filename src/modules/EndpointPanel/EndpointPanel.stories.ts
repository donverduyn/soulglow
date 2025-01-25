import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import { v4 as uuid } from 'uuid';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import type { WithArgs } from '.storybook/utils/args';
import { AppRuntime } from 'modules/App/context';
import EndpointListItem from './components/EndpointListItem';
import EndpointPanel, { type Translations } from './EndpointPanel';

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps

const labels: Translations = {
  addEndpointLabel: uuid(),
};

const meta: Meta<WithArgs<typeof EndpointPanel, { labels: Translations }>> = {
  argTypes: {
    // colorTheme: {
    //   control: { type: 'radio' },
    //   defaultValue: 'Light',
    //   options: ['Light', 'Dark'],
    // },
  },
  args: { labels },
  component: EndpointPanel,
  decorators: [RuntimeDecorator(AppRuntime)],
  globals: { backgrounds: { disabled: true } },
  parameters: { layout: 'centered' },
  subcomponents: { EndpointListItem },
  tags: ['autodocs'],
  title: '@EndpointPanel/EndpointPanel',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByText(labels.addEndpointLabel);
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};
