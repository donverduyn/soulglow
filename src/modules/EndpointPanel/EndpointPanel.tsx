import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Radio } from '@mui/material';
import { css } from '@mui/material/styles';
import { Effect, Queue, flow, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { useEffectOnce } from 'react-use';
import { v4 as uuid } from 'uuid';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { withRuntime } from 'common/hoc/withRuntime';
import { useAsync } from 'common/hooks/useAsync';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { AppRuntime, MessageBus, type Message } from 'context';
import {
  EndpointPanelRuntime,
  EndpointStore,
  createEndpointStore,
  type Endpoint,
} from './context';

const createEndpoint = (id?: string): Endpoint => {
  const _id = id ?? uuid();
  return {
    id: _id,
    name: `endpoint-${_id}`,
    url: 'http://192.168.0.153',
  };
};

export const EndpointPanel = pipe(
  observer(EndpointPanelC),
  withRuntime(EndpointPanelRuntime)
);

const useMessageBus = () => {
  const id = uuid();
  const publish = useRuntimeFn(
    AppRuntime,
    flow((message: string) =>
      Effect.gen(function* () {
        const bus = yield* MessageBus;
        yield* bus.publish({ message, payload: message });
      })
    )
  );

  const register = useRuntimeFn(
    AppRuntime,
    (callback: <T>(message: Message<T>) => void) =>
      Effect.fork(
        Effect.scoped(
          Effect.gen(function* () {
            const bus = yield* MessageBus;
            const dequeue = yield* bus.subscribe;
            const item = yield* Queue.take(dequeue);
            callback({ message: item.message, payload: String(id) });
          }).pipe(Effect.forever)
        )
      )
  );

  return { publish, register };
};

const useEndpointPanel = () => {
  //
  const { publish, register } = useMessageBus();
  const getStore = useRuntimeFn(EndpointPanelRuntime, EndpointStore);
  const { data: store } = useAsync(getStore, createEndpointStore);

  // even though we are using `useEffectOnce` here, it is still triggered multiple times in concurrent mode, so every thing that is done here should be idempotent.

  useEffectOnce(() => {
    store.count.get() === 0 && store.add(createEndpoint());

    void register((message) => {
      console.log('message', message);
    });
    void register((message) => {
      console.log('message2', message);
    });
  });

  useAutorun(() => {
    // console.log('autorun', store.count.get());
  }, [store]);

  return { publish, store };
};

//
function EndpointPanelC() {
  const { publish, store } = useEndpointPanel();

  return (
    <Paper css={styles.root}>
      <Typography>Endpoints</Typography>
      {store.list.get().map((endpoint, index) => (
        <Stack
          key={endpoint.id}
          css={styles.endpoint}
        >
          <Radio
            checked={store.selectedItem.get().id === endpoint.id}
            onChange={() => store.select(index)}
          />
          <TextField
            css={styles.textField}
            getValue={() => endpoint.url}
            onChange={(value) => {
              store.update(endpoint.id, {
                ...endpoint,
                url: value,
              });
            }}
          />
          {/* TODO: wrap IconButton in common/components */}
          <IconButton
            aria-label='delete'
            onClick={() => store.remove(endpoint.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        css={styles.addButton}
        onClick={() => {
          store.add(createEndpoint());
          void publish(
            `http://192.168.0.${String(Math.round(Math.random() * 100))}`
          );
        }}
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
