import type { HasTranslation } from './i18n';

describe('i18n', () => {
  it('should have the translations available with literal object types', () => {
    expect.assertions(1);
    type Locale = { test: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const labels = { test: 'test' } as const;
    type isAvailable = HasTranslation<[Locale], typeof labels>;
    expectTypeOf<isAvailable>().toEqualTypeOf<true>();
  });
});
