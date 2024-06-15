import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Radio } from '@mui/material';
import { css } from '@mui/material/styles';
import { Effect, Queue, type PubSub } from 'effect';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { v4 as uuid } from 'uuid';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { runtime as $ } from 'common/hoc/runtime';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntime } from 'common/hooks/useRuntime';
import { useRuntimeHandler } from 'common/hooks/useRuntimeHandler';
import { type EntityStore, type WithSelected } from 'common/utils/entity';
import { AppRuntime, MessageBus } from 'context';
import { EndpointRuntime, EndpointStore, type Endpoint } from './context';

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

type Store = WithSelected<Endpoint> & EntityStore<Endpoint>;

// the idea is that you inject the pubsub and store into the effects
// then use a special hook that instantiates the effects
// the effects would be be available to the component functioning as a view model
// because every module would need to grab the pubsub and store, we might want to abstract this away in the hook, if it doesn't obscure the code too much

// we might want to steal useRxSuspendSuccess from effect-rx, or at least the idea of it
// because we need to be able to suspend on the store being ready, as we pull it from effect asynchronously

// we also have to think about how we want to update states in the store, i think it makes most sense if we access the store through its api from the effects

const viewModel = <T,>(bus: PubSub.PubSub<T>, store: Store) => {};

// find a name that accurately describes with it does behind the scenes
// as in, runs effects on mount etc
const useViewModel = () => {};

export const EndpointPanel: React.FC<Props> = $(EndpointRuntime)(
  observer(() => {
    const [store, setStore] = React.useState<Store | null>(null);
    useAutorun(() => {
      console.log('autorun', store?.count.get());
    });

    useRuntime(
      AppRuntime,
      Effect.scoped(
        Effect.gen(function* () {
          const bus = yield* MessageBus;
          const dequeue = yield* bus.subscribe;
          const message = yield* Queue.take(dequeue);
          // console.log('take', message);
        }).pipe(Effect.forever)
      )
    );

    useRuntime(
      EndpointRuntime,
      Effect.gen(function* () {
        const store = yield* EndpointStore;
        const endpoint = createEndpoint();
        store.add(endpoint);
        store.select(endpoint.id);
        setStore(store);
      })
    );

    const publish = useRuntimeHandler(AppRuntime, (value: string) => {
      return Effect.gen(function* () {
        const bus = yield* MessageBus;
        yield* bus.publish(value);
      });
    });

    // think about using the value from suspend to render a component that depends on it, as in, if a component needs a store, it should suspend on a separate component and then pass it on to the child component, to avoid conditional hooks from early throws
    // Basically what we do in withAsync, but with effect-rx, while avoiding frameworky abstractions

    return (
      <Paper css={styles.root}>
        <Typography>Endpoints</Typography>
        {[...(store?.list.get() ?? [])].map((endpoint) => (
          <Stack
            key={endpoint.id}
            css={styles.endpoint}
          >
            <Radio
              checked={store?.selectedId.get() === endpoint.id}
              onChange={() => store?.select(endpoint.id)}
            />
            <TextField
              css={styles.textField}
              getValue={() => endpoint.url}
              onChange={(value) => {
                store?.update(endpoint.id, {
                  ...endpoint,
                  url: value,
                });
              }}
            />
            {/* TODO: wrap IconButton in common/components */}
            <IconButton
              aria-label='delete'
              onClick={() => store?.remove(endpoint.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button
          css={styles.addButton}
          onClick={() => {
            store?.add(createEndpoint(String(store.count.get() + 1)));
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
