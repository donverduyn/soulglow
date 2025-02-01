import * as React from 'react';
import { useTranslation as usei18nTranslation } from 'react-i18next';
import type { ArrayTail } from 'type-fest';

export const useTranslation = <T extends string>(
  ...args: Parameters<typeof usei18nTranslation>
) => {
  const usei18n = usei18nTranslation(...args);
  const textFn = React.useCallback(
    (key: T, ...others: ArrayTail<Parameters<typeof usei18n.t>>) =>
      usei18n.t(key, ...others),
    [usei18n]
  );

  return Object.assign(usei18n, { text: textFn });
};
