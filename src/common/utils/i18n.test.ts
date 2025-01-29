import { isTranslationAvailable } from './i18n';

describe('i18n', () => {
  it('should have the translations available', () => {
    expect.assertions(1);
    type Locale = { test: string };
    const labels = { test: 'test' };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAvailable = isTranslationAvailable<[Locale]>()(labels);
    expectTypeOf<typeof isAvailable>().toEqualTypeOf<true>();
  });
});
