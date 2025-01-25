import * as React from 'react';
import { useTranslation as usei18nTranslation } from 'react-i18next';
import type { ArrayTail } from 'type-fest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTranslation = <T extends Record<any, any>>(
  ...args: Parameters<typeof usei18nTranslation>
) => {
  const usei18n = usei18nTranslation(...args);
  const textFn = React.useCallback(
    (
      key: keyof T & string,
      ...others: ArrayTail<Parameters<typeof usei18n.t>>
    ) => usei18n.t(key, ...others),
    [usei18n]
  );

  return Object.assign(usei18n, { text: textFn });
};
