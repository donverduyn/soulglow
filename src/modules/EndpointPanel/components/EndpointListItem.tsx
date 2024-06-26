import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import { css } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useStable } from 'common/hooks/useMemoizedObject';
import { StoreContext } from '../context';
import type { Endpoint } from './../models/Endpoint';

interface Props {
  readonly endpoint: Endpoint;
  readonly index: number;
  // readonly store: ReturnType<typeof createEndpointStore>;
}

const useEndpointListItem = () => {
  const store = React.useContext(StoreContext)!;
  // const getStore = useRuntimeFn(EndpointPanelRuntime, EndpointStore);
  // const { data: store } = useAsync(() => getStore(null), createEndpointStore);
  return useStable({ store: store.current });
};

export const EndpointListItem = observer(EndpointListItemC);

function EndpointListItemC({ endpoint, index }: Props) {
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
