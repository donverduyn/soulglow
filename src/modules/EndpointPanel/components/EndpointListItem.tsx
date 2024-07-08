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

// TODO: think about having a list component that allows instantiating the view model once, if that view model is stateless and can be shared between items
export const EndpointListItem = observer(EndpointListItemComponent);

// TODO: change the way we select the item, because it now depends on the index, this is not ideal, given it can change, if we add or remove items. Although it helps to keep the selected item at the same position, if we remove items, it is not be the best way to handle this.
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
