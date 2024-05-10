// eslint-disable-next-line react/jsx-filename-extension
import {
  Theme,
  ThemeOptions,
  alpha,
  createTheme,
  getContrastRatio,
} from '@mui/material/styles';
import { blend } from '@mui/system/colorManipulator';

const extendTheme = createTheme as (
  theme: Theme,
  options: ThemeOptions
) => Theme;

// const createColor = (color: string) => ({
//   contrastText:
//     getContrastRatio(alpha(color, 0.7), '#fff') > 4.5 ? '#fff' : '#111',
//   dark: alpha(color, 0.9),
//   light: alpha(color, 0.5),
//   main: alpha(color, 0.7),
// });

const commonTheme = createTheme({
  components: {
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
  },
  palette: {
    contrastThreshold: 4.5,
    getContrastText(bg) {
      const darkAlpha = 0.6;
      const lightAlpha = 0.95;
      const darkText = alpha('hsl(0, 0%, 0%)', darkAlpha);
      const lightText = alpha('hsl(0, 0%, 100%)', lightAlpha);
      const contrastD = getContrastRatio(bg, blend(bg, darkText, darkAlpha));
      return contrastD <= this.contrastThreshold! ? lightText : darkText;
    },
    tonalOffset: { dark: 0.3, light: 0.7 },
  },
  shape: { borderRadius: 5 },
  typography: {
    fontFamily: 'Proxima Nova, sans-serif',
    fontSize: 18,
    fontWeightBold: 800,
    fontWeightLight: 500,
    fontWeightMedium: 600,
    fontWeightRegular: 700,
  },
  unstable_strictMode: true,
});

export const lightTheme = extendTheme(commonTheme, {
  palette: {
    action: {
      activatedOpacity: 0.12,
      active: '#000000',
      disabled: '#747474',
      disabledBackground: '#747474',
      disabledOpacity: 0.38,
      focus: '#000000',
      focusOpacity: 0.12,
      // hover: '#000000',
      hoverOpacity: 0.08,
      selected: '#000000',
      selectedOpacity: 0.16,
    },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    divider: '#333',
    error: commonTheme.palette.augmentColor({
      color: { main: '#ec5d10' },
      name: 'error',
    }),
    info: commonTheme.palette.augmentColor({
      color: { main: '#1692d5' },
      name: 'info',
    }),
    mode: 'light',
    primary: commonTheme.palette.augmentColor({
      color: { main: '#727679' },
      name: 'primary',
    }),
    secondary: commonTheme.palette.augmentColor({
      color: { main: '#dbdbdb' },
      name: 'secondary',
    }),
    success: commonTheme.palette.augmentColor({
      color: { main: '#00c846' },
      name: 'success',
    }),
    text: {
      disabled: '#b3b3b3',
      primary: alpha('#000000', 0.7),
      secondary: alpha('#a9a9a9', 0.9),
    },
    warning: commonTheme.palette.augmentColor({
      color: { main: '#ffd900' },
      name: 'warning',
    }),
  },
});

export const darkTheme = extendTheme(commonTheme, {
  components: {
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          color: 'inherit',
        },
      },
    },
  },
  palette: {
    action: {
      activatedOpacity: 0.12,
      active: '#ffffff',
      disabled: '#747474',
      disabledBackground: '#747474',
      disabledOpacity: 0.38,
      focus: '#000000',
      focusOpacity: 0.12,
      // hover: '#ffffff',
      hoverOpacity: 0.08,
      selected: '#ffffff',
      selectedOpacity: 0.16,
    },
    background: { default: '#121212', paper: '#1e1e1e' },
    divider: '#333',
    error: commonTheme.palette.augmentColor({
      color: { main: '#ec5d10' },
      name: 'error',
    }),
    info: commonTheme.palette.augmentColor({
      color: { main: '#1692d5' },
      name: 'info',
    }),
    mode: 'dark',
    primary: commonTheme.palette.augmentColor({
      color: { main: '#727679' },
      name: 'primary',
    }),
    secondary: commonTheme.palette.augmentColor({
      color: { main: '#dbdbdb' },
      name: 'secondary',
    }),
    success: commonTheme.palette.augmentColor({
      color: { main: '#00c846' },
      name: 'success',
    }),
    text: {
      disabled: '#b3b3b3',
      primary: 'rgba(255,255,255,0.87)',
      secondary: 'rgba(164, 171, 173, 0.87)',
    },
    warning: commonTheme.palette.augmentColor({
      color: { main: '#ffd900' },
      name: 'warning',
    }),
  },
});

// const lightTheme2 = createTheme({
//   breakpoints: {
//     keys: ['xs', 'sm', 'md', 'lg', 'xl'],
//     unit: 'px',
//     values: {
//       lg: 1200,
//       md: 900,
//       sm: 600,
//       xl: 1536,
//       xs: 0,
//     },
//   },
//   mixins: {
//     toolbar: {
//       '@media (min-width:0px) and (orientation: landscape)': {
//         minHeight: 48,
//       },
//       '@media (min-width:600px)': {
//         minHeight: 64,
//       },
//       minHeight: 56,
//     },
//   },
//   transitions: {
//     duration: {
//       complex: 375,
//       enteringScreen: 225,
//       leavingScreen: 195,
//       short: 250,
//       shorter: 200,
//       shortest: 150,
//       standard: 300,
//     },
//     easing: {
//       easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
//       easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
//       easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
//       sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
//     },
//   },
// });
