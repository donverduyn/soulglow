import { composeStories, setProjectAnnotations } from '@storybook/react';
import { fireEvent, waitFor, cleanup, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { v4 as uuid } from 'uuid';
import type { TranslationAvailable } from 'i18n';
import type { Translations } from 'modules/EndpointPanel/main';
import * as stories from 'modules/EndpointPanel/main.stories';
import previewAnnotations from './../../../.storybook/preview';
import '@testing-library/jest-dom';

describe('endpointPanel', () => {
  const annotations = setProjectAnnotations([previewAnnotations]);
  const { Primary } = composeStories(stories, annotations);

  beforeAll(annotations.beforeAll);
  afterEach(cleanup);
  it('should have the translations available', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let isAvailable: TranslationAvailable<Translations>;
    expectTypeOf<typeof isAvailable>().toEqualTypeOf<true>();
  });
  it('should add an endpoint to the list when the "Add Endpoint" button is clicked', async () => {
    expect.assertions(2);
    const addEndpointLabel = uuid();

    // TODO: it seems that msw fails to intercept anythin if the first request is unhandled, so if locale is something else than en, en must be handled too.
    const fetchTranslation = http.get('/locales/en/translation.json', () =>
      HttpResponse.json<Translations>({ addEndpointLabel })
    );
    await Primary.run({
      globals: { locale: 'en' },
      parameters: { msw: { handlers: [fetchTranslation] } },
    });

    const addButton = await screen.findByText(addEndpointLabel);
    fireEvent.click(addButton);

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });
});
