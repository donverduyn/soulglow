import * as React from 'react';
import type { i18n as i18next } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { createDecorator } from '.storybook/utils/decorator';

export const I18nDecorator = createDecorator((Story, context) => {
  const { locale } = context.globals as { locale: string };
  const { i18n } = context.loaded as { i18n: i18next };

  React.useEffect(() => {
    if (i18n.language !== locale && i18n.language !== 'cimode') {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <Story />
    </I18nextProvider>
  );
});
