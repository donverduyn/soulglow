import * as React from 'react';
import {
  type Okhsv,
  serializeRgb,
  convertOkhsvToOklab,
  convertOklabToRgb,
} from 'culori/fn';
import { flow, pipe } from 'effect';
import { observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useMutation, useQuery, Provider } from 'urql';
import { v4 as uuid } from 'uuid';
import {
  EndpointPanel_EndpointByPkUpdate,
  EndpointPanel_EndpointByPk,
} from '__generated/gql/operations';
import { Container } from 'common/components/Container/Container';
import { withRuntime } from 'common/components/hoc/withRuntime';
import { useMobx } from 'common/hooks/useMobx/useMobx';
import { AppRuntime, client } from 'modules/App/App.runtime';
import { EndpointPanel } from 'modules/EndpointPanel/EndpointPanel';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import PaletteViewer from 'modules/PaletteViewer/PaletteViewer';
import styles from './App.module.css';
import { EndpointVisibilitySwitch } from './components/EndpointVisibilitySwitch';

const baseColor: Okhsv = {
  h: 0,
  mode: 'okhsv',
  s: 0,
  v: 0,
};

// TODO: consider importing from utils
const formatRgb = flow(convertOkhsvToOklab, convertOklabToRgb, serializeRgb);

export const Main = pipe(AppComponent, withRuntime(AppRuntime));
export default Main;

const Test = () => {
  const [_, updateEndpoint] = useMutation(EndpointPanel_EndpointByPkUpdate);

  const [{ data, error }] = useQuery({
    query: EndpointPanel_EndpointByPk,
    variables: { id: '9b28e012-436a-4c9d-8cce-e7a65f9f5b20' },
  });
  const [count, setCount] = React.useState(0);
  const save = React.useCallback(() => {
    void updateEndpoint({
      id: '9b28e012-436a-4c9d-8cce-e7a65f9f5b20',
      input: {
        id: '9b28e012-436a-4c9d-8cce-e7a65f9f5b20',
        name: `count:${String(count)}`,
        url: 'test',
      },
    });
  }, [count, updateEndpoint]);

  console.log('data', data, error);
  return (
    <div>
      <h1>{data ? data.endpointByPk?.name : 'loading...'}</h1>
      <h2>{String(count)}</h2>
      <button
        onClick={() => setCount((c) => c + 1)}
        type='button'
      >
        Increment
      </button>
      <button
        onClick={save}
        type='button'
      >
        Save
      </button>
    </div>
  );
};

function AppComponent() {
  const state = useMobx(() => ({ color: baseColor }), {
    color: observable.ref,
  });

  // TODO: When this toggles one of the entity stores does not become unobserved. the next cycle it is unobserved. This keeps alternating. Find out why.
  const panel = useMobx(() => ({ isVisible: true }));
  const endpointId = React.useRef(uuid()).current;

  return (
    <Container className={styles.App}>
      <Provider value={client}>
        <Test />
      </Provider>
      <EndpointVisibilitySwitch
        getValue={panel.lazyGet('isVisible')}
        onChange={panel.set('isVisible')}
      />
      <Observer
        render={panel.lazyGet('isVisible', (isVisible) =>
          isVisible ? <EndpointPanel id={`endpoint:${endpointId}`} /> : null
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
