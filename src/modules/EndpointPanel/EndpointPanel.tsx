import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Radio } from '@mui/material';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { WithRuntime } from 'common/hoc/withRuntime';
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
  WithRuntime(EndpointPanelRuntime)
);

function useEndpointPanel() {
  const getStore = useRuntimeFn(EndpointPanelRuntime, EndpointStore);
  const { data: store } = useAsync(() => getStore(null), createEndpointStore);

  // takes a dependency array, to deregister the callbacks
  // any dependencies used in the callback should be passed here
  const bus = useMessageBus([store]);

  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());
    console.log('from useEffect');

    const clearTimeout = setTimeout(() => {
      void bus.register(() => {
        store.add(createEndpoint());
      });
      void bus.register((message) => {
        console.log('message1', message);
      });
    }, 0);

    return () => clearInterval(clearTimeout);
  }, [store, bus]);

  useAutorun(() => {
    // console.log('autorun', store.count.get());
  }, [store]);

  return React.useMemo(() => ({ publish: bus.publish, store }), [store, bus]);
}

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
          void publish({
            message: 'ENDPOINT_ADD',
            payload: {
              id: '123',
              name: 'endpoint-123',
              url: `http://192.168.0.${String(Math.round(Math.random() * 100))}`,
            },
          });
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
