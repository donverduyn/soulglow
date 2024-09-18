import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { css } from '@mui/material/styles';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { IconButton } from 'common/components/IconButton';
import { Radio } from 'common/components/Radio';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import type { Publishable } from 'common/utils/event';
import { AppRuntime, EndpointStore } from 'modules/App/context';
import type { Endpoint } from 'modules/App/models/endpoint/endpoint';
import {
  updateEndpointRequested,
  removeEndpointRequested,
  selectEndpointRequested,
} from 'modules/App/models/endpoint/events';

interface Props extends Publishable {
  readonly endpoint: Endpoint;
}

export const EndpointListItem = observer(EndpointListItem_);

function EndpointListItem_(props: Props) {
  const { getChecked, getUrl } = useGetters(props);
  const { updateFn, removeFn, selectFn } = useHandlers(props);

  return (
    <Stack css={styles.root}>
      <Radio
        getValue={getChecked}
        name={`select_${props.endpoint.id}`}
        onChange={selectFn}
      />
      <TextField
        css={styles.textField}
        getValue={getUrl}
        onChange={updateFn}
      />
      <IconButton
        aria-label='delete'
        onClick={removeFn}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}

//
const useGetters = ({ endpoint }: Props) => {
  const store = useRuntimeSync(AppRuntime, EndpointStore);
  //
  const checked = React.useMemo(
    () => computed(() => store.selectedId.get() === endpoint.id),
    [store, endpoint]
  );

  const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getUrl = React.useCallback(() => endpoint.url, [endpoint]);
  return useReturn({ getChecked, getUrl });
};

// TODO: instead of passing handlers as props, that take dependencies that change often, we migh as well just use an intermediary hook that takes the dependencies and returns the handlers. This way we can memoize the handlers and avoid unnecessary re-renders.
//
const useHandlers = ({ endpoint, publish }: Props) => {
  //
  const selectFn = React.useCallback(
    () => publish(selectEndpointRequested(endpoint.id)),
    [publish, endpoint]
  );

  const updateFn = React.useCallback(
    (value: string) =>
      // TODO: find out why updates are blocked when holding down keys. Only happens when characters are added, not when removed. Might have to do with how the updated value is passed to the store.

      void publish(updateEndpointRequested({ id: endpoint.id, url: value })),
    [publish, endpoint]
  );

  const removeFn = React.useCallback(
    () => void publish(removeEndpointRequested(endpoint.id)),
    [publish, endpoint]
  );
  return useReturn({ removeFn, selectFn, updateFn });
};

//
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
