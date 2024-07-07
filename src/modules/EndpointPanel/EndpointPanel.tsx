import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { WithProvider } from 'common/hoc/withProvider';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useDeferred } from 'common/hooks/useEffectDeferred';
import { useStable } from 'common/hooks/useMemoizedObject';
import { useAutorun } from 'common/hooks/useMobx';
import { useMessageBus } from 'context';
import { endpointActions } from './actions';
import { EndpointListItem } from './components/EndpointListItem';
import {
  EndpointPanelProvider as Provider,
  EndpointPanelRuntime as Runtime,
  EndpointStore,
  Hello,
  EndpointPanelProvider,
  type createEndpointStore,
} from './context';
import { createEndpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelComponent),
  WithProvider(Runtime, Provider, [Hello, EndpointStore]),
  WithRuntime(Runtime)
);

//
//
function useEndpointPanel(
  store: ReturnType<typeof createEndpointStore>,
  bus: ReturnType<typeof useMessageBus>
) {
  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());
  }, [store]);

  useDeferred(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions

      store.add(message.payload);
      console.log('from bus', message, store.list.get());
    });
    void bus.register(console.log);
  }, [store]);

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  const addEndpoint = React.useCallback(() => {
    void bus.publish(endpointActions.add(createEndpoint()));
  }, [bus]);

  return useStable({ addEndpoint, store });
}

//
//
function EndpointPanelComponent() {
  const store = React.useContext(EndpointPanelProvider).get(EndpointStore);
  const bus = useMessageBus([store]);
  const { addEndpoint } = useEndpointPanel(store, bus);

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
