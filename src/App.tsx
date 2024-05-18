import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, css, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatRgb, type Okhsv } from 'culori';
import { Stack } from 'common/components/Stack';
import { useMobx } from 'common/hooks/useMobx';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { PaletteViewer } from 'modules/PaletteViewer/PaletteViewer';
import { ThemeVisualizer } from 'modules/ThemeVisualizer/ThemeVisualizer';
import { createPalettes, darkTheme, lightTheme } from './theme';

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

export const App2: React.FC<DefaultProps> = ({ className }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const state = useMobx(() => ({ color: baseColor }));

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Stack
        className={className}
        css={appStyles.root}
      >
        <LightBulb
          onChange={state.set('color')}
          getStyle={state.lazyGet('color', (value) => ({
            background: formatRgb(value),
          }))}
        />
        <PaletteViewer getPalettes={state.lazyGet('color', createPalettes)} />
        <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} />
      </Stack>
    </ThemeProvider>
  );
};

//! using styled is the only way to get the labels from @swc/plugin-emotion
//! otherwise they seem to come from @mui/material/styles css which picks the label from the component
//! where css is applied inside.
export const App = styled(App2)`
  background: inherit;
`;

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
