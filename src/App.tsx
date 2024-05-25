import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, css } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatRgb, type Okhsv } from 'culori';
import { observable } from 'mobx';
import { Stack } from 'common/components/Stack';
import { useMobx } from 'common/hooks/useMobx';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { PaletteViewer } from 'modules/PaletteViewer/PaletteViewer';
// import { ThemeVisualizer } from 'modules/ThemeVisualizer/ThemeVisualizer';
import { darkTheme, lightTheme } from './theme';

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

export const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const state = useMobx(() => ({ color: baseColor }), {
    color: observable.ref,
  });

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Stack css={appStyles.root}>
        <LightBulb
          onChange={state.set('color')}
          getStyle={state.lazyGet('color', (value) => ({
            background: formatRgb(value),
          }))}
        />
        <PaletteViewer getColor={state.lazyGet('color')} />
        {/* <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} /> */}
      </Stack>
    </ThemeProvider>
  );
};

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
