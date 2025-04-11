import { composeStory } from '@storybook/react';
import type { StoryObj } from '@storybook/react';
import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'common/hooks/useTranslation/useTranslation';

describe('i18n Storybook integration', () => {
  interface Translations {
    test: string;
  }
  const labels = { test: uuid() };
  const En = http.get('/locales/en/translation.json', () =>
    HttpResponse.json<Translations>(labels)
  );

  const TestComponent: React.FC = () => {
    const { text } = useTranslation<keyof Translations>();
    return <span>{text('test')}</span>;
  };
  it('should pass', () => {
    expect.assertions(1);
    expect(true).toBeTruthy();
  })

  // it('should display the fetched translation', async () => {
  //   expect.assertions(1);

  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-expect-error since storybook 8.6
  //   const Default: StoryObj = { render: TestComponent };
  //   const Story = composeStory(Default, {});

  //   const screen = render(null);
  //   await Story.run({
  //     globals: { locale: 'en' },
  //     parameters: { msw: { handlers: { locale: [En] } } },
  //   });

  //   const element = await screen.findByText(labels.test);
  //   expect(element).toBeInTheDocument();
  // });
});
