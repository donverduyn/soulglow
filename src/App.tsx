import CssBaseline from '@mui/material/CssBaseline';
import {
  Theme,
  ThemeOptions,
  ThemeProvider,
  createTheme,
  styled,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LightBulb from 'modules/LightBulb/LightBulb';
import { ThemeVisualizer } from 'modules/ThemeVisualizer/ThemeVisualizer';

const extendTheme = (existing: Theme, theme: ThemeOptions) =>
  createTheme(existing, theme);

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
    tonalOffset: { dark: 0.2, light: 0.25 },
  },
  shape: { borderRadius: 5 },
  typography: {
    fontFamily: 'Proxima Nova, sans-serif',
    fontSize: 16,
    fontWeightBold: 800,
    fontWeightLight: 500,
    fontWeightMedium: 600,
    fontWeightRegular: 700,
  },
  unstable_strictMode: true,
});

const darkTheme = extendTheme(commonTheme, {
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
    // action: {
    //   activatedOpacity: 0.12,
    //   active: '#ffffff',
    //   disabled: '#747474',
    //   disabledBackground: '#747474',
    //   disabledOpacity: 0.38,
    //   focus: '#ff0000',
    //   focusOpacity: 0.12,
    //   hover: '#ffffff',
    //   hoverOpacity: 0.08,
    //   selected: '#ffffff',
    //   selectedOpacity: 0.16,
    // },
    background: { default: '#121212', paper: '#1e1e1e' },
    common: { black: '#000', white: '#fff' },
    // divider: '#333',
    error: commonTheme.palette.augmentColor({
      color: { main: '#a3433c' },
      name: 'error',
    }),
    // grey: grey,
    info: commonTheme.palette.augmentColor({
      color: { main: '#4a7ba3' },
      name: 'info',
    }),
    mode: 'dark',
    primary: commonTheme.palette.augmentColor({
      color: { main: '#78838a' },
      name: 'info',
    }),
    secondary: commonTheme.palette.augmentColor({
      color: { main: '#bababa' },
      name: 'info',
    }),
    success: commonTheme.palette.augmentColor({
      color: { main: '#499540' },
      name: 'info',
    }),
    text: {
      disabled: '#b3b3b3',
      primary: 'rgba(255,255,255,0.87)',
      secondary: 'rgba(164, 173, 172, 0.87)',
    },
    warning: commonTheme.palette.augmentColor({
      color: { main: '#cb5b2b' },
      name: 'info',
    }),
  },
});

const lightTheme = extendTheme(commonTheme, {
  palette: {
    action: {
      //   activatedOpacity: 0.12,
      active: '#000000',
      //   disabled: '#747474',
      //   disabledBackground: '#747474',
      //   disabledOpacity: 0.38,
      //   focus: '#000000',
      //   focusOpacity: 0.12,
      //   hover: '#000000',
      //   hoverOpacity: 0.08,
      //   selected: '#000000',
      //   selectedOpacity: 0.16,
    },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    // common: { black: '#000', white: '#fff' },
    contrastThreshold: 3,
    // divider: '#333',
    // error: {
    //   contrastText: '#ffffff',
    //   dark: '#d32f2f',
    //   light: '#e57373',
    //   main: '#f44336',
    // },
    // grey: grey,
    // info: {
    //   contrastText: '#ffffff',
    //   dark: '#1976d2',
    //   light: '#64b5f6',
    //   main: '#2196f3',
    // },
    mode: 'light',
    primary: {
      // contrastText: '#000000',
      // dark: '#747474',
      // light: '#b3b3b3',
      main: '#000000',
    },
    // secondary: {
    //   contrastText: '#000000',
    //   dark: '#747474',
    //   light: '#b3b3b3',
    //   main: '#b3b3b3',
    // },
    // success: {
    //   contrastText: '#ffffff',
    //   dark: '#388e3c',
    //   light: '#81c784',
    //   main: '#4caf50',
    // },
    text: {
      // disabled: '#b3b3b3',
      primary: '#808080',
      // secondary: '#000000',
    },
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

const AppBase = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className='App'>
        {/* <header className='App-header'>
         
        </header> */}
        <LightBulb />
        <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} />
      </div>
    </ThemeProvider>
  );
};

export const App = styled(AppBase)({});
