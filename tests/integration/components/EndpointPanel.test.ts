import { composeStories, setProjectAnnotations } from '@storybook/react';
import { fireEvent, waitFor, cleanup, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { v4 as uuid } from 'uuid';
import previewAnnotations from '.storybook/preview';
import type { TranslationAvailable } from 'i18n';
import type { Translations } from 'modules/EndpointPanel/EndpointPanel';
import * as stories from 'modules/EndpointPanel/EndpointPanel.stories';
import '@testing-library/jest-dom';

describe('endpointPanel', () => {
  const annotations = setProjectAnnotations([previewAnnotations]);
  const { Default } = composeStories(stories, annotations);

  beforeAll(annotations.beforeAll);
  afterEach(cleanup);
  it('should have the translations available', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAvailable: TranslationAvailable<Translations> = true;
    expectTypeOf<typeof isAvailable>().toEqualTypeOf<true>();
  });
  it('should add an endpoint to the list when the "Add Endpoint" button is clicked', async () => {
    expect.assertions(2);
    // this should work with a uuid, but it seems that the dom is overridden because of concurrent tests.
    const addEndpointLabel = 'Add Endpoint';

    // TODO: it seems that msw fails to intercept anythin if the first request is unhandled, so if locale is something else than en, en must be handled too.
    const fetchTranslation = http.get('/locales/en/translation.json', () =>
      HttpResponse.json<Translations>({ addEndpointLabel })
    );
    await Default.run({
      globals: { locale: 'en' },
      parameters: { msw: { handlers: [fetchTranslation] } },
    });

    const addButton = await screen.findByText(addEndpointLabel);
    fireEvent.click(addButton);

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(4);
    });
  });
});
