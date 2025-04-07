import type { ComponentType } from 'react';
import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/test';
import type { i18n } from 'i18next';
import { HttpResponse } from 'msw';
import { v4 as uuid } from 'uuid';
import { defineEndpointFactory, dynamic } from '__generated/gql/fabbrica';
import { mockEndpointPanelEndpointByPkQuery } from '__generated/gql/mocks.msw';
import { ColorSchemeDecorator } from '_storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '_storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '_storybook/decorators/ThemeDecorator';
import type { ExtendArgs } from '_storybook/utils/args';
import { prettierForSourceInDev } from '_storybook/utils/parameters';
import { EndpointListItemView } from './components/EndpointListItem';
import { EndpointPanel, EndpointPanelView } from './EndpointPanel';
import { AppRuntime } from 'modules/App/App.runtime';

// TODO: move this to a shared location, because it is domain agnostic
const endpointFactory = defineEndpointFactory({
  defaultFields: {
    __typename: 'endpoint',
    id: dynamic(() => uuid()),
    name: dynamic(({ seq }) => `Endpoint-${String(seq)}`),
    url: dynamic(() => faker.internet.url()),

    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    createdAt: dynamic(() => faker.date.recent().toISOString()),
    updatedAt: dynamic(async ({ get }) => {
      const date = faker.date.between({
        from: (await get('createdAt')) as string,
        to: new Date(),
      });
      return date.toISOString();
    }),
  },
});

const endpointSuccess = mockEndpointPanelEndpointByPkQuery(async (info) => {
  console.log(info);
  // TODO: filter out fields that are not part of the query
  return HttpResponse.json({
    data: { endpointByPk: await endpointFactory.build() },
  });
});

const meta: Meta<ExtendArgs<typeof EndpointPanel>> = {
  argTypes: {
    // colorTheme: {
    //   control: { type: 'radio' },
    //   defaultValue: 'Light',
    //   options: ['Light', 'Dark'],
    // },
    labels: { table: { disable: true } },
  },

  args: { id: 'endpoint:1', labels: EndpointPanel.labels },
  component: EndpointPanelView,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    a11y: { test: 'todo' },
    docs: prettierForSourceInDev(),
    layout: 'centered',
  },
  render: ({ id }) => <EndpointPanel id={id} />,
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
