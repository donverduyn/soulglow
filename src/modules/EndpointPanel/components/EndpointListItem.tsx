import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import { css } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useStable } from 'common/hooks/useStable';
import { EndpointPanelProvider, EndpointStore } from '../context';
import type { Endpoint } from './../models/Endpoint';

interface Props {
  readonly endpoint: Endpoint;
  readonly index: number;
}

const useEndpointListItem = () => {
  const store = React.useContext(EndpointPanelProvider).get(EndpointStore);
  return useStable({ store });
};

export const EndpointListItem = observer(EndpointListItemComponent);

function EndpointListItemComponent({ endpoint, index }: Props) {
  const { store } = useEndpointListItem();
  return (
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
