import {
  createTheme,
  rem,
  // colorsTuple
} from '@mantine/core';

// const variantColorResolver: VariantColorsResolver = (input) => {
//   const defaultResolvedColors = defaultVariantColorsResolver(input);
//   const parsedColor = parseThemeColor({
//     color: input.color || input.theme.primaryColor,
//     theme: input.theme,
//     colorScheme: 'light'
//   });

// console.log(input, defaultResolvedColors, parsedColor);

// const isDarkMode = true;
// const colors = {
//   background: isDarkMode ? input.theme.white : input.theme.black,
//   borderColor: isDarkMode ? input.theme.white : input.theme.black,
//   textColor: isDarkMode ? input.theme.black : input.theme.white,
// };

// if (input.variant === 'filled') {
//   return {
//     background: colors.background,
//     border: 'none',
//     color: colors.textColor,
//     hover: 'black',
//   };
// }

// if (input.variant === 'outline') {
//   return {
//     background: 'transparent',
//     border: `1px solid ${colors.borderColor}`,
//     color: colors.textColor,
//     hover: 'black',
//   };
// }

// if (input.variant === 'light') {
//   return {
//     background: 'transparent',
//     border: 'none',
//     color: colors.textColor,
//     hover: 'black',
//   };
// }

// Fallback for other variants
//   return defaultVariantColorsResolver(input);
// };

export const theme = createTheme({
  colors: {
    // crimson: colorsTuple('crimson'),
    // dark: [
    //   '#1e1e1e',
    //   '#333',
    //   '#4d4d4d',
    //   '#666',
    //   '#808080',
    //   '#999',
    //   '#b3b3b3',
    //   '#ccc',
    //   '#e6e6e6',
    //   '#f0f0f0',
    // ],
    blue: [
      '#e4f9ff',
      '#d1eefd',
      '#a5d9f6',
      '#75c4ef',
      '#4fb2ea',
      '#38a7e7',
      '#27a2e7',
      '#158dce',
      '#007db9',
      '#006da4',
    ],
    gray: [
      '#f5f5f5',
      '#e7e7e7',
      '#cdcdcd',
      '#b2b2b2',
      '#9a9a9a',
      '#8b8b8b',
      '#848484',
      '#717171',
      '#656565',
      '#575757',
    ],
    green: [
      '#e6ffef',
      '#d0ffe0',
      '#9efec0',
      '#6bfe9d',
      '#43fe80',
      '#2efe6d',
      '#22fe62',
      '#15e352',
      '#00c947',
      '#00ae39',
    ],
    orange: [
      '#fff0e4',
      '#ffe0cf',
      '#fac0a1',
      '#f59d6e',
      '#f28043',
      '#f06e28',
      '#ef6419',
      '#d5530c',
      '#be4907',
      '#a63c00',
    ],
    yellow: [
      '#fffce1',
      '#fff8cb',
      '#fff09a',
      '#ffe864',
      '#ffe138',
      '#ffdd1c',
      '#ffda09',
      '#e3c100',
      '#caab00',
      '#ae9400',
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'Proxima Nova, sans-serif',
  // variantColorResolver,
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(18),
    lg: rem(20),
    xl: rem(24),
  },
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(20),
  },
  black: '#000',
  autoContrast: true,

  cursorType: 'pointer',
  /* eslint-enable sort-keys-fix/sort-keys-fix */
  headings: {
    fontFamily: 'Proxima Nova, sans-serif',
    fontWeight: '800',
    sizes: {
      h1: { fontSize: rem(32), lineHeight: rem(40) },
      h2: { fontSize: rem(24), lineHeight: rem(32) },
      h3: { fontSize: rem(20), lineHeight: rem(28) },
      h4: { fontSize: rem(18), lineHeight: rem(24) },
      h5: { fontSize: rem(16), lineHeight: rem(24) },
      h6: { fontSize: rem(14), lineHeight: rem(20) },
    },
    textWrap: 'wrap',
  },
  luminanceThreshold: 0.5,
  primaryColor: 'gray',
  primaryShade: { dark: 5, light: 7 },
  white: '#fff',
  
});
