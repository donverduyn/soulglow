import * as React from 'react';
import type { Decorator } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { initializeI18N } from 'i18n';

const i18n = initializeI18N();

export const I18nDecorator: Decorator = (render, context) => {
  const { locale } = context.globals as { locale: string };
  React.useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);
  return <I18nextProvider i18n={i18n}>{render()}</I18nextProvider>;
};
