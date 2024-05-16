// eslint-disable-next-line react/jsx-filename-extension
import {
  Theme,
  ThemeOptions,
  alpha,
  createTheme,
  getContrastRatio,
} from '@mui/material/styles';
import { blend } from '@mui/system/colorManipulator';
import {
  converter,
  differenceEuclidean,
  formatHex,
  nearest,
  type Okhsv,
} from 'culori';
import ColorThief from 'common/utils/extract';

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
  shape: { borderRadius: 10 },
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
      color: { main: '#ffffff' },
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
      primary: 'rgba(255,255,255,1)',
      secondary: 'rgba(255,255,255, 0.6)',
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

function adjustHue(val: number) {
  if (val < 0) val += Math.ceil(-val / 360) * 360;

  return val % 360;
}

function createScientificPalettes(baseColor: Okhsv, factor: number = 0.5) {
  const targetHueSteps = {
    analogous: [30, 0, 60].map((step) => step * factor),
    complementary: [0, 180].map((step) => step * factor),
    splitComplementary: [150, 0, 210].map((step) => step * factor),
    tetradic: [90, 270, 0, 180].map((step) => step * factor),
    triadic: [120, 0, 240].map((step) => step * factor),
  };

  const monochromeSteps = [-50, -25, 0, 25, 50];

  const palettes: Record<string, Array<Okhsv>> = {};

  for (const type of Object.keys(targetHueSteps)) {
    palettes[type] = targetHueSteps[type as keyof typeof targetHueSteps].map(
      (step) => ({
        h: adjustHue(baseColor.h! + step),
        mode: 'okhsv',
        s: baseColor.s,
        v: baseColor.v,
      })
    );
  }

  palettes.monochrome = monochromeSteps.map((step) => ({
    h: baseColor.h!,
    mode: 'okhsv',
    s: baseColor.s,
    v: Math.max(baseColor.v + step / 100, 0),
  }));

  return palettes;
}

export const createPalettes = (baseColor: Okhsv) =>
  createScientificPalettes(baseColor);

export function generate() {
  // choose a random base color
  const base = {
    h: Math.random() * 360,
    mode: 'okhsv',
    s: 60 + Math.random() * 10,
    v: 50 + Math.random() * 10,
  } as Okhsv;

  // generate "classic" color palettes
  const palettes = createScientificPalettes(base);

  // choose a random palette
  const choice = Object.entries(palettes)[Math.floor(Math.random() * 6)][1];

  // convert palette to HEX
  const paletteHex = choice.map((color) => formatHex(color));

  // take the "base" color, and make a light, desaturated version of it. This will be perfect for background colors, etc.
  const lightest = formatHex({
    ...choice[0],
    s: 10,
    v: 98,
  });

  // take the "base" color, and make a dark, desaturated version of it. This will be perfect for text!
  const darkest = formatHex({
    ...choice[0],
    s: 20,
    v: 10,
  });

  return { darkest, lightest, palette: paletteHex };
}

function isColorEqual(c1: Okhsv, c2: Okhsv) {
  return c1.h === c2.h && c1.v === c2.v && c1.s === c2.s;
}

const toOkhsv = converter('okhsv');

const baseColors = [
  '#FFB97A',
  '#FF957C',
  '#FF727F',
  '#FF5083',
  '#F02F87',
  '#C70084',
  '#9A007F',
  '#6A0076',
  '#33006B',
];

const baseColorsOkhsv = baseColors.map((color) => toOkhsv(color)!);

export function discoverPalettes(colors: Okhsv[] = baseColorsOkhsv) {
  const palettes: Record<string, { colors: Okhsv[]; variance: number }> = {};

  for (const color of colors) {
    const targetPalettes = createScientificPalettes(color);

    for (const paletteType of Object.keys(targetPalettes)) {
      const palette: Okhsv[] = [];
      let variance = 0;

      for (const targetColor of targetPalettes[paletteType]) {
        // filter out colors already in the palette
        const availableColors = colors.filter(
          (color1) => !palette.some((color2) => isColorEqual(color1, color2))
        );

        const match = nearest(
          availableColors,
          differenceEuclidean('okhsv')
        )(targetColor)[0];

        variance += differenceEuclidean('okhsv')(targetColor, match);

        palette.push(match);
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!palettes[paletteType] || variance < palettes[paletteType].variance) {
        palettes[paletteType] = {
          colors: palette,
          variance,
        };
      }
    }
  }

  return palettes;
}

const colorThief = new ColorThief();

async function loadImg(url: string) {
  const img = document.createElement('img');

  img.src = url;
  img.crossOrigin = `anonymous`;

  await img.decode();

  return img;
}

export async function generatePalette() {
  let colors: Okhsv[] = [];
  let chosenImg;

  const queries = [
    'red',
    'green',
    'blue',
    'yellow',
    'orange',
    'magenta',
    'pink',
    'purple',
    'turqoise',
    'grey',
    'black',
    'white',
    'indigo',
    'violet',
    'emerald',
    'flower',
    'vibrant',
    'gold',
    'silver',
    'jewels',
    'rainbow',
    'forest',
    'ocean',
    'coral',
    'galaxy',
    'tree',
    'leaf',
    'fish',
    'frog',
    'animal',
    'wildlife',
    'color',
    'paint',
    'paint',
    'abstract',
    'colorful',
    'nature',
    'volcano',
    'sun',
    'ruby',
    'saphire',
    'emerald',
    '',
  ];

  while (colors.length < 4) {
    const url = `https://source.unsplash.com/random?${
      queries[Math.floor(Math.random() * queries.length - 1)]
    }`;
    chosenImg = await loadImg(url);

    colors = colorThief.getPalette(chosenImg).map((color) =>
      toOkhsv({
        b: color[2] / 255,
        g: color[1] / 255,
        mode: 'rgb',
        r: color[0] / 255,
      })
    );
  }

  const palettes = discoverPalettes(colors);
  return palettes;
}

function map(
  n: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

export function createHueShiftPalette(opts: {
  base: Okhsv;
  hueStep: number;
  maxLightness: number;
  minLightness: number;
}) {
  const { base, minLightness, maxLightness, hueStep } = opts;

  const palette = [base];

  for (let i = 1; i < 5; i++) {
    const hueDark = adjustHue(base.h! - hueStep * i);
    const hueLight = adjustHue(base.h! + hueStep * i);
    const lightnessDark = map(i, 0, 4, base.v, minLightness);
    const lightnessLight = map(i, 0, 4, base.v, maxLightness);
    const chroma = base.s;

    palette.push({
      h: hueDark,
      mode: 'okhsv',
      s: chroma,
      v: lightnessDark,
    });

    palette.unshift({
      h: hueLight,
      mode: 'okhsv',
      s: chroma,
      v: lightnessLight,
    });
  }

  return palette;
}
