import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import { http, HttpResponse } from 'msw';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import EndpointListItem from './components/EndpointListItem';
import EndpointPanel, { type Translations } from './EndpointPanel';
// type Foo = Simplify<typeof AppTags>;

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps

const fetchTranslationEn = http.get('/locales/nl/translation.json', () =>
  HttpResponse.json<Translations>({ addEndpointLabel: 'toevoegen kut' })
);
const fetchTranslationNl = http.get('/locales/en/translation.json', () =>
  HttpResponse.json<Translations>({ addEndpointLabel: 'add pleazz' })
);

const meta: Meta<typeof EndpointPanel> = {
  argTypes: {
    // colorTheme: {
    //   control: { type: 'radio' },
    //   defaultValue: 'Light',
    //   options: ['Light', 'Dark'],
    // },
  },
  component: EndpointPanel,
  decorators: [RuntimeDecorator(AppRuntime)],
  parameters: {
    layout: 'centered',
    msw: {
      handlers: {
        locale: [fetchTranslationEn, fetchTranslationNl],
      },
    },
  },
  subcomponents: {
    EndpointListItem: EndpointListItem as React.ComponentType<unknown>,
  },
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
  // globals: { backgrounds: { disabled: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByText('Add Endpoint');
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};
