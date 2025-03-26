import * as React from 'react';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { MdOutlineDelete } from 'react-icons/md';
import type { Simplify } from 'type-fest';
import { IconButton } from 'common/components/IconButton/IconButton';
import { Radio } from 'common/components/Radio/Radio';
import { Stack } from 'common/components/Stack/Stack';
import { TextInput } from 'common/components/TextInput/TextInput';
// import { useRuntimeFn } from 'common/hooks/useRuntimeFn/useRuntimeFn';
import type { Publishable } from 'common/utils/event';
import {
  updateEndpointRequested,
  removeEndpointRequested,
  selectEndpointRequested,
} from 'models/endpoint/EndpointEvents';
// import { AppRuntime } from 'modules/App/context';
// import * as AppTags from 'modules/App/tags';
import type { EndpointEntity } from '../effect/entities/EndpointEntity';
import styles from './EndpointListItem.module.css';

export interface Props extends Publishable {
  readonly endpoint: EndpointEntity;
}

const classNames = {
  root: styles.EndpointListItem,
};

type InferProps<T> = T extends React.FC<infer P> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withSugar = <C extends React.FC<any>>(component: C) =>
  component as React.FC<Simplify<InferProps<C>>>;

export const EndpointListItem = pipe(observer(EndpointListItemView), withSugar);

/**
 * This component is responsible for rendering a single endpoint item in the list.
 * It normalizes the behavior of the input across OSes and browsers.
 * It also provides a way to select, update, and remove the endpoint.
 */
export function EndpointListItemView(props: Props) {
  const { checked, url, select, update, remove } = useEndpointListItem(props);

  return (
    <Stack
      classNames={classNames}
      component='li'
    >
      <Radio
        data-id={props.endpoint.id}
        getValue={checked}
        name={`select_${props.endpoint.id}`}
        onChange={select}
      />
      <TextInput
        className={styles.TextField}
        data-id={props.endpoint.id}
        getValue={url}
        onChange={update}
      />
      <IconButton
        aria-label='delete'
        className={styles.Button}
        data-id={props.endpoint.id}
        onClick={remove}
        size='xl'
        variant='subtle'
      >
        <MdOutlineDelete size={28} />
      </IconButton>
    </Stack>
  );
}

const useEndpointListItem = ({ publish, endpoint }: Props) => {
  const vm = React.useRef<EndpointListItemVM>(null as never);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return vm.current ?? (vm.current = new EndpointListItemVM(publish, endpoint));
};

// TODO: think about an abstract VM class as well as separating the methods from the properties, because the methods only rely on publish and threfore it makes more sense to share a single class instance between all list item components.
class EndpointListItemVM {
  private static publish: Publishable['publish'];

  constructor(
    publish: Publishable['publish'],
    private readonly endpoint: EndpointEntity
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!EndpointListItemVM.publish) {
      EndpointListItemVM.publish = publish;
    }
    this.url = this.url.bind(this);
    this.checked = this.checked.bind(this);
  }

  checked() {
    return false;
  }
  url() {
    return this.endpoint.url;
  }

  public select(e: React.ChangeEvent<HTMLInputElement>) {
    const id = e.currentTarget.dataset.id!;
    EndpointListItemVM.publish(selectEndpointRequested(id));
  }
  public update(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>,
    url: string
  ) {
    const id = e.currentTarget.dataset.id!;
    EndpointListItemVM.publish(updateEndpointRequested({ id, url }));
  }
  public remove(e: React.MouseEvent<HTMLButtonElement>) {
    const id = e.currentTarget.dataset.id!;
    EndpointListItemVM.publish(removeEndpointRequested(id));
  }
}

// const store = useRuntimeSync(EndpointPanelRuntime, Tags.EndpointStore);
//
// const checked = React.useMemo(
//   () => computed(() => store.selectedId.get() === endpoint.id),
//   [store, endpoint]
// );
