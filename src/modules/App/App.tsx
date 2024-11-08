import * as React from 'react';
import { css } from '@emotion/react';
import {
  type Okhsv,
  serializeRgb,
  convertOkhsvToOklab,
  convertOklabToRgb,
} from 'culori/fn';
import { Console, Effect, flow, pipe } from 'effect';
import { observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { Container } from 'common/components/Container';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { useMobx } from 'common/hooks/useMobx';
import { useRuntime } from 'common/hooks/useRuntimeFn';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from 'modules/EndpointPanel/EndpointPanel';
import LightBulb from 'modules/LightBulb/LightBulb';
import PaletteViewer from 'modules/PaletteViewer/PaletteViewer';
import { EndpointVisibilitySwitch } from './components/EndpointVisibilitySwitch';
import * as Tags from './tags';

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

// TODO: consider importing from utils
const formatRgb = flow(convertOkhsvToOklab, convertOklabToRgb, serializeRgb);

export const Main = pipe(AppComponent, WithRuntime(AppRuntime));
export default Main;

function AppComponent() {
  const state = useMobx(() => ({ color: baseColor }), {
    color: observable.ref,
  });

  useRuntime(
    AppRuntime,
    Effect.andThen(Tags.EventBus, (bus) => bus.register(Console.log))
  );

  // TODO: When this toggles one of the entity stores does not become unobserved. the next cycle it is unobserved. This keeps alternating. Find out why.
  const panel = useMobx(() => ({ isVisible: true }));

  return (
    <Container 
      // css={appStyles.root}
    >
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
      {/* <ThemeVisualizer theme={prefersDarkMode ? darkTheme : darkTheme} /> */}
    </Container>
  );
}

// const appStyles = {
//   root: css`
//     display: flex;
//     flex: 1;
//     flex-direction: column;
//     gap: 1rem;
//     max-height: 100vh;
//     padding: 1rem;
//     width: 35rem;
//   `,
// };
