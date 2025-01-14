import { composeStories } from '@storybook/react';
import { fireEvent, waitFor, screen, cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { TranslationAvailable } from 'i18n';
import type { Translations } from 'modules/EndpointPanel/EndpointPanel';
import * as stories from 'modules/EndpointPanel/EndpointPanel.stories';
import '@testing-library/jest-dom';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('endpointPanel', () => {
  const { Default } = composeStories(stories);

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  // afterEach(cleanup);
  it('should have the translations available', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAvailable: TranslationAvailable<Translations> = true;
    expectTypeOf<typeof isAvailable>().toEqualTypeOf<true>();
  });
  it('should add an endpoint to the list when the "Add Endpoint" button is clicked', async () => {
    expect.assertions(1);

    const Nl = http.get('/locales/nl/translation.json', () =>
      HttpResponse.json<Translations>(Default.args.labels)
    );

    const En = http.get('/locales/en/translation.json', () =>
      HttpResponse.json<Translations>(Default.args.labels)
    );

    await Default.run({
      globals: { locale: 'en' },
      parameters: { msw: { handlers: { locale: [En, Nl] } } },
    });
    // const screen = render(<div />)
    console.log('foo');
    // screen.debug();
    // await act(async () => {
    // vi.runAllTicks();
    await vi.runAllTimersAsync();
    // });

    console.log('bar');
    // screen.debug();

    const label = Default.args.labels!.addEndpointLabel;
    const addButton = await screen.findByText(label);
    fireEvent.click(addButton);

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });
});
