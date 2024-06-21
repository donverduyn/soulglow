import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { useEffectOnce } from 'react-use';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useAsync } from 'common/hooks/useAsync';
import { useEffectDeferred } from 'common/hooks/useEffectDeferred';
import { useFn } from 'common/hooks/useFn';
import { useStable } from 'common/hooks/useMemoizedObject';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useMessageBus } from 'context';
import { EndpointListItem } from './components/EndpointListItem';
import {
  EndpointPanelRuntime,
  EndpointStore,
  createEndpointStore,
} from './context';
import { createEndpoint, type Endpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelC),
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
  const getStore = useRuntimeFn(EndpointPanelRuntime, EndpointStore);
  const { data: store } = useAsync(() => getStore(null), createEndpointStore);
  const bus = useMessageBus([store]);

  useEffectOnce(() => {
    store.count.get() === 0 && store.add(createEndpoint());
  });

  useEffectDeferred(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      store.add(message.payload);
    });
    void bus.register(console.log);
  }, [store]);

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  const addEndpoint = useFn(() => {
    const endpoint = createEndpoint();
    void bus.publish(addEndpointMessage(endpoint));
  });

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
