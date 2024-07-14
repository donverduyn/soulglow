import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { WithProvider } from 'common/hoc/withProvider';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useDeferred } from 'common/hooks/useEffectDeferred';
import { useAutorun } from 'common/hooks/useMobx';
import { useStable } from 'common/hooks/useStable';
import { useMessageBus } from 'context';
import { endpointActions } from './actions';
import { EndpointListItem } from './components/EndpointListItem';
import {
  EndpointPanelProvider as Provider,
  EndpointPanelRuntime as Runtime,
  EndpointStore,
  Hello,
} from './context';
import { createEndpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelComponent),
  WithProvider(Runtime, Provider, [Hello, EndpointStore]),
  WithRuntime(Runtime)
);

//
function EndpointPanelComponent() {
  const { addEndpoint, store, hello } = useEndpointPanel();
  hello.showCount();

  return (
    <Paper css={styles.root}>
      {/* <Typography>Endpoints</Typography> */}
      {store.list.get().map((endpoint, index) => {
        return (
          <EndpointListItem
            key={endpoint.id}
            endpoint={endpoint}
            index={index}
          />
        );
      })}
      <Button
        css={styles.addButton}
        onClick={addEndpoint}
      >
        Add endpoint
      </Button>
    </Paper>
  );
}

function useEndpointPanel() {
  const store = React.useContext(Provider).get(EndpointStore);
  const hello = React.useContext(Provider).get(Hello);

  // TODO: Think about using a service to use the bus where the methods return effects to compose, instead of encapsulating the hooks.
  const bus = useMessageBus([store]);

  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());
  }, [store]);

  useDeferred(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      store.add(message.payload);
    });
  }, [store]);

  useAutorun(() => {
    console.log('[autorun] count:', hello.showCount());
  }, [store]);

  const addEndpoint = React.useCallback(() => {
    void bus.publish(endpointActions.add(createEndpoint()));
  }, [bus]);

  return useStable({ addEndpoint, hello, store });
}

const styles = {
  addButton: css`
    /* background: green; */
  `,
  endpoint: css`
    display: flex;
    flex-direction: row;
    gap: 1em;
    /* flex: 1; */
  `,
  root: css`
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
  textField: css`
    --label: TextField;
    flex: 1;
  `,
};
