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
import type { Endpoint } from 'common/models/endpoint/endpoint';
import { updateEndpointRequested } from 'common/models/endpoint/events';
import type { Publishable } from 'common/utils/event';
import { EndpointPanelRuntime, EndpointStore } from '../context';

interface Props extends Publishable {
  readonly endpoint: Endpoint;
}

export const EndpointListItem = observer(EndpointListItemComponent);

function EndpointListItemComponent({ endpoint, publish }: Props) {
  // TODO: think about the cost of holding a memoized reference to the store for each item
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const checked = computed(() => store.selectedId.get() === endpoint.id);

  return (
    <Stack css={styles.root}>
      <Radio
        getValue={() => checked.get()}
        onChange={() => store.selectById(endpoint.id)}
      />
      <TextField
        css={styles.textField}
        getValue={() => endpoint.url}
        onChange={(value) => {
          // TODO: find out why updates are blocked when holding down keys. Only happens when characters are added, not when removed. Might have to do with how the updated value is passed to the store.
          void publish(
            updateEndpointRequested({ id: endpoint.id, url: value })
          );
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
  root: css`
    --label: EndpointListItem;
    display: flex;
    flex-direction: row;
    gap: 1em;
  `,
  textField: css`
    --label: TextField;
    flex: 1;
  `,
};
