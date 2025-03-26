import type { ComponentType } from 'react';
import type { Meta, StoryObj, StoryContext } from '@storybook/react';
import { within, userEvent } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import type { i18n } from 'i18next';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import type { ExtendArgs } from '_storybook/utils/args';
import { AppRuntime } from 'modules/App/context';
import { EndpointListItemView } from './components/EndpointListItem';
import { EndpointPanel, EndpointPanelView } from './EndpointPanel';

const isDev = process.env.NODE_ENV === 'development';

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
  component: EndpointPanelView,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    docs: {
      canvas: isDev ? {} : { sourceState: 'none' },
      source: isDev
        ? {
            transform: async (code: string, storyContext: StoryContext) => {
              const { unwrapAndFixMemoJSX } = await import(
                '_storybook/utils/source'
              );
              return unwrapAndFixMemoJSX(code, storyContext);
            },
          }
        : { sourceShown: null },
    },
    layout: 'centered',
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
type Story = StoryObj<ExtendArgs<typeof EndpointPanel>>;

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
