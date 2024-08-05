import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { css } from '@mui/material/styles';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Radio } from 'common/components/Radio';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { EndpointPanelRuntime, EndpointStore } from '../context';
import type { Endpoint } from './../models/Endpoint';

interface Props {
  readonly endpoint: Endpoint;
}

export const EndpointListItem = observer(EndpointListItemComponent);

function EndpointListItemComponent({ endpoint }: Props) {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const checked = computed(() => store.selectedId.get() === endpoint.id);

  return (
    <Stack css={styles.endpoint}>
      {/* TODO: wrap Radio in common/components and use late derefencing */}
      <Radio
        getValue={() => checked.get()}
        onChange={() => store.selectById(endpoint.id)}
      />
      <TextField
        css={styles.textField}
        getValue={() => endpoint.url}
        onChange={(value) => {
          // TODO: consider using lazySet interface, because immutable updates cause unnecessary re-renders
          store.update(endpoint.id, {
            ...endpoint,
            url: value,
          });
        }}
      />
      <IconButton
        aria-label='delete'
        onClick={() => store.remove(endpoint.id)}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}
// TODO: wrap IconButton in common/components

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
