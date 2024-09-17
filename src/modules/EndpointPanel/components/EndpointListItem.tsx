import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { css } from '@mui/material/styles';
import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Radio } from 'common/components/Radio';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import type { Publishable } from 'common/utils/event';
import { AppRuntime, EndpointStore } from 'modules/App/context';
import type { Endpoint } from 'modules/App/models/endpoint/endpoint';
import { updateEndpointRequested } from 'modules/App/models/endpoint/events';

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
// TODO: wrap IconButton in common/components

const useGetters = (props: Props) => {
  const store = useRuntimeSync(AppRuntime, EndpointStore);
  //
  const checked = React.useMemo(
    () => computed(() => store.selectedId.get() === props.endpoint.id),
    [store, props.endpoint]
  );

  const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getUrl = React.useCallback(() => props.endpoint.url, [props.endpoint]);
  return useReturn({ getChecked, getUrl });
};

const useHandlers = (props: Props) => {
  const store = useRuntimeSync(AppRuntime, EndpointStore);
  //
  // TODO: publish event instead of using store directly
  const selectFn = React.useCallback(
    () => store.selectById(props.endpoint.id),
    [store, props.endpoint]
  );

  // TODO: find out why updates are blocked when holding down keys. Only happens when characters are added, not when removed. Might have to do with how the updated value is passed to the store.

  const updateFn = React.useCallback(
    (value: string) =>
      void props.publish(
        updateEndpointRequested({ id: props.endpoint.id, url: value })
      ),
    [props]
  );

  // TODO: publish event instead of using store directly
  const removeFn = React.useCallback(
    () => store.remove(props.endpoint.id),
    [store, props.endpoint]
  );
  return useReturn({ removeFn, selectFn, updateFn });
};

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
