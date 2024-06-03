import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { css } from '@mui/material/styles';
import { Console, Layer, Stream, pipe } from 'effect';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { Typography } from 'common/components/Typography';
import { createRuntimeContext, runtime } from 'common/hoc/runtime';
import { useMobx } from 'common/hooks/useMobx';
import { useRuntime } from 'common/hooks/useRuntime';
import type { Endpoint } from './constants';

interface Props extends DefaultProps {
  readonly onChange: (endpoints: Endpoint) => void;
}

const createEndpoint = (id: string): Endpoint => ({
  id,
  name: `endpoint-${id}`,
  url: 'http://192.168.0.153',
});

const defaults = {
  list: [createEndpoint('1')],
  selectedId: '1',
};

const EndpointRuntime = createRuntimeContext(Layer.empty);

export const EndpointPanel: React.FC<Props> = runtime(EndpointRuntime)(({
  onChange,
}) => {
  const endpoints = useMobx(() => defaults);

  useRuntime(
    EndpointRuntime,
    pipe(
      Stream.fromEventListener(window, 'click'),
      Stream.tap((e) => Console.log(e)),
      Stream.runCollect
    )
  );

  return (
    <Paper css={styles.root}>
      <Typography>Endpoints</Typography>
      {endpoints.list.map((endpoint) => (
        <Stack
          key={endpoint.id}
          css={styles.endpoint}
        >
          <TextField
            css={styles.textField}
            getValue={() => endpoint.url}
            onChange={() => {}}
            // onChange={endpoints.set('list', (value, list) => {
            // const item = list.find(({ id }) => id === endpoint.id);
            // item.url = value;
            // return list.map((item) => item);
            // })}
          />
          {/* TODO: wrap IconButton in common/components */}
          <IconButton
            aria-label='delete'
            onClick={() => {}}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        css={styles.addButton}
        // onClick={() => {
        //   const endpoint = createEndpoint((endpoints.length + 1).toString());
        //   setEndpoints([...endpoints, endpoint]);
        //   setSelected(endpoint.id);
        // }}
      >
        Add endpoint
      </Button>
    </Paper>
  );
});

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
