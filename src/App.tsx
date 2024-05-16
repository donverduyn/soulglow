import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type Lch } from 'culori';
import { observer } from 'mobx-react-lite';
import { useAutorun, useMobx } from 'common/hooks/useMobx';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { PaletteViewer } from 'modules/PaletteViewer/PaletteViewer';
import { createPalettes, darkTheme, lightTheme } from './theme';

const AppBase: React.FC<DefaultProps> = ({ className }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const baseColor: Lch = {
    c: 30,
    h: 140,
    l: 80,
    mode: 'lch',
  };

  const color = useMobx(() => ({ color: baseColor }));

  useAutorun(() => {
    console.log(color.color.c);
  });

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className={className}>
        {/* <header className='App-header'>
         
        </header> */}
        <LightBulb
          onChange={color.set('color', (value) => {
            return {
              c: value.saturation / .25,
              h: value.hue,
              l: value.level,
              mode: 'lch' as const,
            };
          })}
        />
        <PaletteViewer
          getPalettes={color.lazyGet('color', (value) => {
            return createPalettes(value);
          })}
        />
        {/* <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} /> */}
      </div>
    </ThemeProvider>
  );
};

export const App = styled(observer(AppBase))`
  background: inherit;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1em;
  margin: 0 auto;
  padding: 1em;
  width: 40em;
`;
