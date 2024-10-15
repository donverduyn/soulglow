import '@mantine/core';

import type { EmotionStyles, EmotionSx } from '@mantine/emotion';

declare module '@mantine/core' {
  export interface BoxProps {
    styles?: EmotionStyles;
    sx?: EmotionSx;
  }
}
