import createCache from '@emotion/cache';
import { isProduction } from './constants';

export const getEmotionCacheConfig: (
  prefix: string
) => Parameters<typeof createCache>[0] = (prefix) => ({
  key: prefix,
  ...(isProduction && { stylisPlugins: [] }),
});
