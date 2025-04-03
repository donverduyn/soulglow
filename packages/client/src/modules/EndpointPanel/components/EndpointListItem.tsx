import * as React from 'react';
import { Effect, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { MdOutlineDelete } from 'react-icons/md';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { IconButton } from 'common/components/IconButton/IconButton';
import { Radio } from 'common/components/Radio/Radio';
import { Stack } from 'common/components/Stack/Stack';
import { TextInput } from 'common/components/TextInput/TextInput';
import type { Publishable, EventType } from 'common/utils/event';
import {
  updateEndpointRequested as updateEndpoint,
  removeEndpointRequested as removeEndpoint,
  selectEndpointRequested as selectEndpoint,
} from 'models/endpoint/EndpointEvents';
import type { EndpointEntity } from '../effect/entities/Endpoint.entity';
import { EndpointPanelRuntime } from '../EndpointPanel.runtime';
import * as Tags from '../tags';
import styles from './EndpointListItem.module.css';

export interface Props extends Publishable {
  readonly endpoint: EndpointEntity;
}

const classNames = {
  root: styles.EndpointListItem,
};

export const EndpointListItem = pipe(
  observer(EndpointListItemView),
  WithRuntime(EndpointPanelRuntime, (configure) => {
    const λ = configure();
    return {
      publish: λ.useFn((e: EventType<unknown>) =>
        Effect.andThen(Tags.EventBus, (bus) => bus.publish(e))
      ),
    };
  })
);

/**
 * This component is responsible for rendering a single endpoint item in the list.
 * It normalizes the behavior of the input across OSes and browsers.
 * It also provides a way to select, update, and remove the endpoint.
 */
export function EndpointListItemView(props: Props) {
  const vm = useEndpointListItem(props);
  return (
    <Stack
      classNames={classNames}
      component='li'
    >
      <Radio
        getValue={vm.getChecked}
        name={`select_${vm.id}`}
        onChange={vm.select}
      />
      <TextInput
        className={styles.TextField}
        getValue={vm.getUrl}
        onChange={vm.update}
      />
      <IconButton
        aria-label='delete'
        className={styles.Button}
        onClick={vm.remove}
        size='xl'
        variant='subtle'
      >
        <MdOutlineDelete size={28} />
      </IconButton>
    </Stack>
  );
}

const useEndpointListItem = ({ endpoint, publish }: Props) => {
  const { id } = endpoint;
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

  // properties that change cannot be dereferenced outside of the callback
  // this is not a problem because we never destroy the proxies so the references are stable
  const getUrl = React.useCallback(() => endpoint.url, [endpoint]);
  const getChecked = React.useCallback(() => false, []);
  return { getChecked, getUrl, id, remove, select, update };
};

// const store = useRuntimeSync(EndpointPanelRuntime, Tags.EndpointStore);
//
// const checked = React.useMemo(
//   () => computed(() => store.selectedId.get() === endpoint.id),
//   [store, endpoint]
// );
