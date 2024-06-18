import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Radio } from '@mui/material';
import { css } from '@mui/material/styles';
import { Effect, Queue, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { v4 as uuid } from 'uuid';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { withRuntime } from 'common/hoc/withRuntime';
import { useAsync } from 'common/hooks/useAsync';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntime } from 'common/hooks/useRuntime';
import { useRuntimeFn } from 'common/hooks/useRuntimeHandler';
import { AppRuntime, MessageBus } from 'context';
import {
  EndpointRuntime,
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
  withRuntime(EndpointRuntime)
);

const useEndpointPanel = () => {
  const getStore = useRuntimeFn(EndpointRuntime, EndpointStore);
  const { data: store } = useAsync(getStore, createEndpointStore);

  // Even though we can interact with the store directly, if we want to use the reactive context, we need to provide the store as a dependency to the hook, because useAutorun, will otherwise keep a reference to the optimistic store.

  // Using the store in useEffect, usually means you interact with the optimistic store, but this is fine, as any changes will be merged into the real store when the async operation completes.

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  React.useEffect(() => {
    if (store.count.get() === 0) {
      const endpoint = createEndpoint();
      store.add(endpoint);
    }
  }, []);

  void useRuntime(
    AppRuntime,
    Effect.scoped(
      Effect.gen(function* () {
        const bus = yield* MessageBus;
        const dequeue = yield* bus.subscribe;
        const message = yield* Queue.take(dequeue);
        console.log('take', message);
      }).pipe(Effect.forever)
    )
  );

  const publish = useRuntimeFn(
    AppRuntime,
    pipe(
      MessageBus,
      Effect.andThen((bus) => {
        bus.publish({ message: 'foo', payload: 'bar' });
      })
    )
  );

  return { publish, store };
};

// find a name that accurately describes with it does behind the scenes
// as in, runs effects on mount etc
// const useViewModel = () => {};

// const context = Context.empty().pipe(
//   Context.add(EndpointStore, createEndpointStore())
// );

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
