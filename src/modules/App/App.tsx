import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, css } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatRgb, type Okhsv } from 'culori';
import { Console, pipe } from 'effect';
import { observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { Stack } from 'common/components/Stack';
import { Toggle } from 'common/components/Toggle';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useMobx } from 'common/hooks/useMobx';
import { useRuntime } from 'common/hooks/useRuntimeFn';
import { fromLayer } from 'common/utils/context';
import { AppRuntime, EventBus } from 'modules/App/context';
import { EndpointPanel } from 'modules/EndpointPanel/EndpointPanel';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { PaletteViewer } from 'modules/PaletteViewer/PaletteViewer';
import { darkTheme } from '../../theme';

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

export const App = pipe(AppComponent, WithRuntime(AppRuntime));

function AppComponent() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const state = useMobx(() => ({ color: baseColor }), {
    color: observable.ref,
  });

  useRuntime(
    AppRuntime,
    // EventBus.pipe(Effect.andThen((bus) => bus.register(Effect.logInfo)))
    fromLayer(EventBus, (bus) => bus.register((event) => Console.log(event)))
  );

  // TODO: When this toggles one of the entity stores does not become unobserved. the next cycle it is unobserved. This keeps alternating. Find out why.
  const panel = useMobx(() => ({ isVisible: true }));

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : darkTheme}>
      <CssBaseline />
      <Stack css={appStyles.root}>
        <Toggle
          getValue={panel.lazyGet('isVisible')}
          name='endpoint_panel_toggle'
          onChange={panel.set('isVisible')}
        />
        <Observer
          render={panel.lazyGet('isVisible', (isVisible) =>
            isVisible ? <EndpointPanel /> : null
          )}
        />
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
}

const appStyles = {
  root: css`
    background: inherit;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1em;
    margin: 0 auto;
    padding: 1em;
    width: 30em;
  `,
};
