import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { WithContextService } from 'common/hoc/withContextService';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useDeferred } from 'common/hooks/useEffectDeferred';
import { useStable } from 'common/hooks/useMemoizedObject';
import { useAutorun } from 'common/hooks/useMobx';
import { useMessageBus } from 'context';
import { EndpointListItem } from './components/EndpointListItem';
import {
  EndpointPanelRuntime,
  EndpointStore,
  StoreContext,
  createEndpointStore,
} from './context';
import { createEndpoint, type Endpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelC),
  WithContextService(
    EndpointPanelRuntime,
    EndpointStore,
    createEndpointStore,
    StoreContext
  ),
  WithRuntime(EndpointPanelRuntime)
);

const createMessage =
  <T,>(message: string) =>
  (payload: T) => ({
    message,
    payload,
  });

const addEndpointMessage = createMessage<Endpoint>('ENDPOINT_ADD');

function useEndpointPanel() {
  const store = React.useContext(StoreContext)!;
  const bus = useMessageBus([store]);

  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());
  }, [store]);

  useDeferred(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      store.add(message.payload);
    });
    void bus.register(console.log);
  }, [store]);

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    void bus.publish(addEndpointMessage(endpoint));
  }, [bus]);

  return useStable({ addEndpoint, store });
}

function EndpointPanelC() {
  const { addEndpoint, store } = useEndpointPanel();

  return (
    <Paper css={styles.root}>
      {/* <Typography>Endpoints</Typography> */}
      {store.list.get().map((endpoint, index) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          index={index}
        />
      ))}
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
