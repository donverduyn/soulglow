import * as React from 'react';
import { flow } from 'effect';
import { observer } from 'mobx-react-lite';
import { MdOutlineDelete } from 'react-icons/md';
import type { Simplify } from 'type-fest';
import { IconButton } from 'common/components/IconButton/IconButton';
import { Radio } from 'common/components/Radio/Radio';
import { Stack } from 'common/components/Stack/Stack';
import { TextInput } from 'common/components/TextInput/TextInput';
import { useReturn } from 'common/hooks/useReturn';
import type { Publishable } from 'common/utils/event';
import {
  updateEndpointRequested,
  removeEndpointRequested,
  selectEndpointRequested,
} from 'models/endpoint/EndpointEvents';
import type { EndpointEntity } from '../effect/entities/EndpointEntity';
import styles from './EndpointListItem.module.css';

export interface Props extends Publishable {
  endpoint: EndpointEntity;
}

const classNames = {
  root: styles.EndpointListItem,
};

type InferProps<T> = T extends React.FC<infer P> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withSugar = <C extends React.FC<any>>(component: C) =>
  component as React.FC<Simplify<InferProps<C>>>;

const Component = flow(observer<Props>, withSugar);

/**
 * This component is responsible for rendering a single endpoint item in the list.
 * It normalizes the behavior of the input across OSes and browsers.
 * It also provides a way to select, update, and remove the endpoint.
 */
export const EndpointListItem = Component(function EndpointListItem(props) {
  const { getChecked, getUrl, updateFn, removeFn, selectFn } =
    useEndpointListItem(props);

  return (
    <Stack
      classNames={classNames}
      component='li'
    >
      <Radio
        getValue={getChecked}
        name={`select_${props.endpoint.id}`}
        onChange={selectFn}
      />
      <TextInput
        className={styles.TextField}
        getValue={getUrl}
        onChange={updateFn}
      />
      <IconButton
        aria-label='delete'
        className={styles.Button}
        onClick={removeFn}
        size='xl'
        variant='subtle'
      >
        <MdOutlineDelete size={28} />
      </IconButton>
    </Stack>
  );
});

const useEndpointListItem = (props: Props) => {
  const getters = useGetters(props);
  const handlers = useHandlers(props);
  return useReturn({ ...getters, ...handlers });
};

//
const useGetters = ({ endpoint }: Props) => {
  // const store = useRuntimeSync(EndpointPanelRuntime, Tags.EndpointStore);
  //
  // const checked = React.useMemo(
  //   () => computed(() => store.selectedId.get() === endpoint.id),
  //   [store, endpoint]
  // );

  // const getChecked = React.useCallback(() => checked.get(), [checked]);
  const getChecked = React.useCallback(() => false, []);
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
      void publish(updateEndpointRequested({ id: endpoint.id, url: value })),
    [publish, endpoint]
  );

  const removeFn = React.useCallback(
    () => void publish(removeEndpointRequested(endpoint.id)),
    [publish, endpoint]
  );
  return useReturn({ removeFn, selectFn, updateFn });
};
