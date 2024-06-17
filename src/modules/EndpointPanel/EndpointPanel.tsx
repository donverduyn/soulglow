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
import { runtime as withRuntime } from 'common/hoc/runtime';
import { useAsyncProxy } from 'common/hooks/useAsyncProxy';
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

interface Props extends DefaultProps {
  readonly onChange: (endpoints: Endpoint) => void;
}

const createEndpoint = (id?: string): Endpoint => {
  const _id = id ?? uuid();
  return {
    id: _id,
    name: `endpoint-${_id}`,
    url: 'http://192.168.0.153',
  };
};

// the idea is that you inject the pubsub and store into the effects
// then use a special hook that instantiates the effects
// the effects would be be available to the component functioning as a view model
// because every module would need to grab the pubsub and store, we might want to abstract this away in the hook, if it doesn't obscure the code too much

// we might want to steal useRxSuspendSuccess from effect-rx, or at least the idea of it
// because we need to be able to suspend on the store being ready, as we pull it from effect asynchronously

// we also have to think about how we want to update states in the store, i think it makes most sense if we access the store through its api from the effects

// const viewModel = <T,>(bus: PubSub.PubSub<T>, store: Store) => {};

// find a name that accurately describes with it does behind the scenes
// as in, runs effects on mount etc
// const useViewModel = () => {};

// const context = Context.empty().pipe(
//   Context.add(EndpointStore, createEndpointStore())
// );

export const EndpointPanel: React.FC<Props> = withRuntime(EndpointRuntime)(
  observer(() => {
    const id = React.useMemo(() => uuid(), []);
    const getStore = useRuntimeFn(EndpointRuntime, EndpointStore);
    const { data: store, loading } = useAsyncProxy(
      getStore,
      createEndpointStore,
      (old, current) => {
        if (current.count.get() === 0) {
          current.merge(old);
        }
        return current;
      }
    );

    console.log({ id, loading, store });
    useAutorun(
      () => {
        console.log('autorun', store.count.get());
      },
      {},
      [store]
    );

    // still uses the stale store
    React.useEffect(() => {
      if (store.count.get() === 0) {
        const endpoint = createEndpoint();
        store.add(endpoint);
        store.select(endpoint.id);
      }
    }, [store]);

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
        Effect.andThen((bus) => bus.publish({ message: 'foo', payload: 'bar' }))
      )
    );

    return (
      <Paper css={styles.root}>
        <Typography>Endpoints</Typography>
        {[...(store.list.get() ?? [])].map((endpoint) => (
          <Stack
            key={endpoint.id}
            css={styles.endpoint}
          >
            <Radio
              checked={store.selectedId.get() === endpoint.id}
              onChange={() => store.select(endpoint.id)}
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
  })
);

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
