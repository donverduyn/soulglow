import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Radio } from '@mui/material';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { untracked } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { withRuntime } from 'common/hoc/withRuntime';
import { useAsync } from 'common/hooks/useAsync';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useMessageBus } from 'context';
import {
  EndpointPanelRuntime,
  EndpointStore,
  createEndpointStore,
} from './context';
import { createEndpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelC),
  // this causes fast refresh to lose state when used directly
  withRuntime(EndpointPanelRuntime)
);

function useEndpointPanel() {
  const bus = useMessageBus();
  const getStore = useRuntimeFn(EndpointPanelRuntime, EndpointStore);
  const { data: store } = useAsync(
    getStore,
    () => Object.assign(createEndpointStore(), { id: 'optimistic' }),
    (result, data) => {
      console.log('merge', result.list.get(), data.list.get());
      result.merge(data);
      console.log('merge', result.list.get(), data.list.get());
    }
  );
  console.log({ count: untracked(() => store.count.get()) });
  // When store is ready and updated async, useEffect will run again.
  // Note that the previous register callbacks will stay alive and update the optimistic store through the stale closure.

  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());

    void bus.register(() => {
      // console.log(store.count.get());
      console.log('message2', message);
      // store.add(createEndpoint());
    });
    void bus.register((message) => {
      console.log('message2', message);
    });
  }, [store, bus]);

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  return React.useMemo(() => ({ publish: bus.publish, store }), [store]);
}

function EndpointPanelC() {
  const { publish, store } = useEndpointPanel();
  console.log(store.id);
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
          console.log(store.id);
          store.add(createEndpoint());
          // void publish({
          //   message: 'ENDPOINT_ADD',
          //   payload: {
          //     id: uuid(),
          //     name: 'endpoint-123',
          //     url: `http://192.168.0.${String(Math.round(Math.random() * 100))}`,
          //   },
          // });
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
