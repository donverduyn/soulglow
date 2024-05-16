import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, css } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { converter, formatCss, type Okhsv } from 'culori';
import { observer } from 'mobx-react-lite';
import { Stack } from 'common/components/Stack';
import { useMobx } from 'common/hooks/useMobx';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { PaletteViewer } from 'modules/PaletteViewer/PaletteViewer';
import { ThemeVisualizer } from 'modules/ThemeVisualizer/ThemeVisualizer';
import { createPalettes, darkTheme, lightTheme } from './theme';

const baseColor: Okhsv = {
  h: 140,
  mode: 'okhsv',
  s: 0.3,
  v: 0.8,
};

export const App: React.FC<DefaultProps> = observer(() => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const color = useMobx(() => ({ color: baseColor }));

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Stack css={appStyles.root}>
        <LightBulb
          getStyle={color.lazyGet('color', (value) => ({
            background: formatCss(converter('hsl')(value)),
          }))}
          onChange={color.set('color', (value) => ({
            h: value.hue,
            mode: 'okhsv' as const,
            s: value.saturation / 100,
            v: value.level / 100,
          }))}
        />
        <PaletteViewer
          getPalettes={color.lazyGet('color', (value) => {
            return createPalettes(value);
          })}
        />
        <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} />
      </Stack>
    </ThemeProvider>
  );
});

const appStyles = {
  root: css`
    background: inherit;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1em;
    margin: 0 auto;
    padding: 1em;
    width: 40em;
  `,
};
