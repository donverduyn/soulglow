import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { MdOutlineDelete } from 'react-icons/md';
import { IconButton } from 'common/components/IconButton/IconButton';
import { Radio } from 'common/components/Radio/Radio';
import { Stack } from 'common/components/Stack/Stack';
import { TextInput } from 'common/components/TextInput/TextInput';
// import { useRuntimeFn } from 'common/hooks/useRuntimeFn/useRuntimeFn';
import type { Publishable } from 'common/utils/event';
import {
  updateEndpointRequested as updateEndpoint,
  removeEndpointRequested as removeEndpoint,
  selectEndpointRequested as selectEndpoint,
} from 'models/endpoint/EndpointEvents';
// import { AppRuntime } from 'modules/App/App.runtime';
// import * as AppTags from 'modules/App/tags';
import type { EndpointEntity } from '../effect/entities/Endpoint.entity';
import styles from './EndpointListItem.module.css';

export interface Props extends Publishable {
  readonly endpoint: EndpointEntity;
}

const classNames = {
  root: styles.EndpointListItem,
};

export const EndpointListItem = observer(EndpointListItemView);

/**
 * This component is responsible for rendering a single endpoint item in the list.
 * It normalizes the behavior of the input across OSes and browsers.
 * It also provides a way to select, update, and remove the endpoint.
 */
export function EndpointListItemView({ endpoint, publish }: Props) {
  const { getChecked, getUrl, select, update, remove } = useEndpointListItem({
    endpoint,
    publish,
  });

  return (
    <Stack
      classNames={classNames}
      component='li'
    >
      <Radio
        getValue={getChecked}
        name={`select_${endpoint.id}`}
        onChange={select}
      />
      <TextInput
        className={styles.TextField}
        getValue={getUrl}
        onChange={update}
      />
      <IconButton
        aria-label='delete'
        className={styles.Button}
        onClick={remove}
        size='xl'
        variant='subtle'
      >
        <MdOutlineDelete size={28} />
      </IconButton>
    </Stack>
  );
}

const useEndpointListItem = ({ endpoint: { id, url }, publish }: Props) => {
  const remove = React.useCallback(
    () => publish(removeEndpoint(id)),
    [publish, id]
  );

  const update = React.useCallback(
    (url: string) => publish(updateEndpoint({ id, url })),
    [publish, id]
  );

  const select = React.useCallback(
    () => publish(selectEndpoint(id)),
    [publish, id]
  );

  const getUrl = React.useCallback(() => url, [url]);
  const getChecked = React.useCallback(() => false, []);
  return { getChecked, getUrl, remove, select, update };
};

// TODO: think about an abstract VM class as well as separating the methods from the properties, because the methods only rely on publish and threfore it makes more sense to share a single class instance between all list item components.

// const store = useRuntimeSync(EndpointPanelRuntime, Tags.EndpointStore);
//
// const checked = React.useMemo(
//   () => computed(() => store.selectedId.get() === endpoint.id),
//   [store, endpoint]
// );
