import type { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import type { i18n } from 'i18next';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import type { ExtendArgs } from '.storybook/utils/args';
import { unwrapAndFixMemoJSX } from '.storybook/utils/source';
import { AppRuntime } from 'modules/App/context';
import { EndpointListItemView } from './components/EndpointListItem';
import { EndpointPanel, EndpointPanelView } from './EndpointPanel';

// TODO: we need to think about how we want to spy on effectful deps

const meta: Meta<ExtendArgs<typeof EndpointPanel>> = {
  argTypes: {
    // colorTheme: {
    //   control: { type: 'radio' },
    //   defaultValue: 'Light',
    //   options: ['Light', 'Dark'],
    // },
    labels: { table: { disable: true } },
  },

  args: { labels: EndpointPanel.labels },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: EndpointPanelView as ComponentType<any>,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    docs: { source: { transform: unwrapAndFixMemoJSX } },
    layout: 'centered',
  },
  // @ts-expect-error since storybook 8.6
  render: EndpointPanel,
  subcomponents: { EndpointListItemView } as Record<
    string,
    ComponentType<unknown>
  >,
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
  play: async ({ canvasElement, loaded, args }) => {
    const { i18n } = loaded as { i18n: i18n };
    const canvas = within(canvasElement);

    const text = i18n.t(args.labels.addEndpointLabel);
    const button = await canvas.findByText(text);
    await userEvent.click(button);
    await userEvent.click(button);
  },
};
