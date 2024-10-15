import { renderHook, type RenderOptions } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { useTranslation } from 'common/hooks/useTranslation';

interface Translations {
  readonly key1: string;
  readonly key2: string;
}

const en: Translations = {
  key1: 'Hello',
  key2: 'World',
};

const nl: Translations = {
  key1: 'Hallo',
  key2: 'Wereld',
};

describe('useTranslation', () => {
  beforeAll(() => {
    void i18n.use(initReactI18next).init({
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      lng: 'en',
      resources: {
        en: { translation: en },
        nl: { translation: nl },
      },
    });
  });

  const Wrapper: RenderOptions['wrapper'] = ({ children }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );

  it('should return the correct translation for a single key', () => {
    expect.assertions(1);
    const hook = renderHook(() => useTranslation<Translations>(), {
      wrapper: Wrapper,
    });

    expect(hook.result.current.text('key1')).toBe('Hello');
  });

  it('should return the correct translation for multiple keys', () => {
    expect.assertions(1);
    const invalidKey = 'key3';
    const validKey = 'key2';
    const hook = renderHook(() => useTranslation<Translations>(), {
      wrapper: Wrapper,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Testing invalid key with fallback
    expect(hook.result.current.text([invalidKey, validKey])).toBe(en[validKey]);
  });

  it('should return the correct translation with parameters', () => {
    expect.assertions(1);
    const key = 'key3';
    const id = 'name';
    const replacer = `{{${id}}}`;
    const value = 'Hello';
    const arg = 'John';

    i18n.addResource('en', 'translation', key, `${value} ${replacer}`);
    const hook = renderHook(() => useTranslation<{ key3: string }>(), {
      wrapper: Wrapper,
    });

    expect(hook.result.current.text(key, { [id]: arg })).toBe(
      `${value} ${arg}`
    );
  });
});
