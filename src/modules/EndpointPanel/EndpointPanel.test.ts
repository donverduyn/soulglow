import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { Locales, HasTranslation } from 'common/utils/i18n';
import * as stories from 'modules/EndpointPanel/EndpointPanel.stories';

describe('endpointPanel', () => {
  const { Default } = composeStories(stories);

  const label = Default.args.labels!.addEndpointLabel;
  const En = http.get('/locales/en/translation.json', () =>
    HttpResponse.json(Default.args.labels)
  );

  it('should have all of the translations available', () => {
    expect.assertions(1);
    type Labels = NonNullable<typeof Default.args.labels>;
    expectTypeOf<HasTranslation<Locales, Labels>>().toEqualTypeOf<true>();
  });

  it('should render the endpoint panel', async () => {
    expect.assertions(1);

    const screen = render(null);
    await Default.run({
      globals: { locale: 'en' },
      parameters: { msw: { handlers: { locale: [En] } } },
    });

    const addButton = await screen.findByText(label);
    expect(addButton).toBeInTheDocument();
  });
});
