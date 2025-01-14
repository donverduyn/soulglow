import type { Meta, StoryObj } from '@storybook/react';
// import { within, userEvent, expect, screen, waitFor } from '@storybook/test';
import { within } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import type { WithArgs } from '.storybook/utils/args';
import { AppRuntime } from 'modules/App/context';
import EndpointListItem from './components/EndpointListItem';
import EndpointPanel, { type Translations } from './EndpointPanel';
// import { http, HttpResponse, delay } from 'msw';

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps

const labels: Translations = {
  addEndpointLabel: 'Add Endpoint',
};

// const En = http.get('/locales/en/translation.json', async () => {
//   await delay(300);
//   return HttpResponse.json<Translations>(meta.args!.labels)
// });

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
  // globals: { locale: 'en' },
  // parameters: { msw: { handlers: { locale: [En] } } },
  // parameters: { layout: 'centered' },
  subcomponents: { EndpointListItem },
  tags: ['autodocs'],
  title: '@EndpointPanel/EndpointPanel',
};

export default meta;
type Story = StoryObj<typeof meta>;

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Default: Story = {
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  // globals: { backgrounds: { disabled: true } },
  play: ({ canvasElement }) => {
    // await mount();
    // const canvas = await mount();
    // await sleep(1000)
    const canvas = within(canvasElement);

    // const button = await waitFor(() => canvas.getByText('Add Endpoint'));
    // Wait for the updated text to appear after Suspense resolves
    // await waitFor(() => {
    //   expect(canvas.getByText(labels.addEndpointLabel)).toBeInTheDocument();
    // }, { timeout: 3000 });
    // screen.debug();
    // const button = await canvas.findByText(labels.addEndpointLabel);
    // await userEvent.click(button);
    // await userEvent.click(button);
    // await expect(button).toBeInTheDocument();
  },
};
