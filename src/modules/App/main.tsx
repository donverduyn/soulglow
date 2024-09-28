import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, css } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatRgb, type Okhsv } from 'culori';
import { identity, pipe } from 'effect';
import { observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { applyMiddleware, legacy_createStore } from 'redux';
import * as ReduxSaga from 'redux-saga';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { Stack } from 'common/components/Stack';
import { useMobx } from 'common/hooks/useMobx';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from 'modules/EndpointPanel/main';
import LightBulb from 'modules/LightBulb/main';
import PaletteViewer from 'modules/PaletteViewer/main';
import { darkTheme } from '../../theme';
import { EndpointVisibilitySwitch } from './components/EndpointVisibilitySwitch';

// TODO: move this to a layer
const sagaMiddleware = ReduxSaga.default();
const store = legacy_createStore(identity, applyMiddleware(sagaMiddleware));
// sagaMiddleware.run(rootSaga);

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

export const Main = pipe(AppComponent, WithRuntime(AppRuntime));
export default Main;

function AppComponent() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const state = useMobx(() => ({ color: baseColor }), {
    color: observable.ref,
  });

  // TODO: When this toggles one of the entity stores does not become unobserved. the next cycle it is unobserved. This keeps alternating. Find out why.
  const panel = useMobx(() => ({ isVisible: true }));

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : darkTheme}>
      <CssBaseline />
      <Stack css={appStyles.root}>
        <EndpointVisibilitySwitch
          getValue={panel.lazyGet('isVisible')}
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
