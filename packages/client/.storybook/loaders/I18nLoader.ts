import type { Loader } from '@storybook/react';
import { initializeI18N } from './../../src/i18n';

export const I18nLoader: Loader = async () => ({
  i18n: await new Promise(initializeI18N),
});
