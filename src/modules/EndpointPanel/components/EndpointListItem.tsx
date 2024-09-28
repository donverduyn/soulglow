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
import type { Endpoint } from 'models/endpoint/endpoint';
import {
  updateEndpointRequested,
  removeEndpointRequested,
  selectEndpointRequested,
} from 'models/endpoint/events';
import { AppRuntime, AppTags } from 'modules/App';

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
  const store = useRuntimeSync(AppRuntime, AppTags.EndpointStore);
  //
  const checked = React.useMemo(
    () => computed(() => store.selectedId.get() === endpoint.id),
    [store, endpoint]
  );

  const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getUrl = React.useCallback(() => endpoint.url, [endpoint]);
  return useReturn({ getChecked, getUrl });
};

// TODO: think about delegating events to the parent component, because we currently memoize on a per listitem basis, which is not ideal. We can simply pass the handlers as props from the parent component and memoize them
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
    display: flex;
    flex-direction: row;
    gap: 1em;
  `,
  textField: css`
    flex: 1;
  `,
};
