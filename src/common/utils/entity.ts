import * as Mobx from 'mobx';
import { v4 as uuid } from 'uuid';

export interface EntityStore<T extends Identifiable> {
  add: (entity: T) => void;
  count: Mobx.IComputedValue<number>;
  get: (id: string) => T | null;
  id: string;
  indexOf: (id: string) => number;
  list: Mobx.IComputedValue<T[]>;
  remove: (id: string) => void;
  update: (id: string, map: (current: T) => void) => void;
}

// TODO: we might want to consider a composable crud mapper, that allows to map actions on a certain entity to a store instance using an effect. This way, if we need to share state between different modules, we can fetch and populate from a single source. By combining this with global event replays, we can restore previous state on a component remount, if this is not synced on the backend.

export const createEntityStore = <T extends Identifiable>() => {
  const store = Mobx.observable.map<string, T>([], {
    // deep: false,
    proxy: false,
  });

  const api: EntityStore<T> = {
    add: Mobx.action((entity) => store.set(entity.id, entity)),
    count: Mobx.computed(() => store.size),
    get: (id) => store.get(id) ?? null,
    id: uuid(),
    // TODO: find out why eslint cannot resolve mobx types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    indexOf: (id: string) => Array.from(store.keys()).indexOf(id),
    list: Mobx.computed(() => Array.from(store.values() as T[])),
    remove: Mobx.action((id) => store.delete(id)),
    update: Mobx.action((id, mapFn) => mapFn(store.get(id)!)),
  };

  // onBecomeObserved(store, () => {
  //   console.log('observed', api.id);
  // });
  // onBecomeUnobserved(store, () => {
  //   console.log('unobserved', api.id);
  // });

  return Object.assign(api, {
    merge: (other: typeof api) => {
      other.list.get().forEach((item) => api.add(item));
    },
  });
};

// We infer the previous type as U through the parameter of merge. By intersecting with the inferred generic, we can compose any additional added properties. TypeScript automaticallly deduplicates the overlapping properties from Entitystore<T> which is part of the inferred generic U.

export type WithPrevious<T> = T & {
  merge: (other: T) => void;
};

export const withSelected = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const id = Mobx.observable.box<string | null>(null);

    const api = {
      ...(store as EntityStore<T> & U),
      selectById: Mobx.action((value: string) => id.set(value)),
      selectedId: Mobx.computed(() => id.get()),
      selectedItem: Mobx.computed(() => store.get(id.get() ?? '')),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        // api.selectById(other.selectedId.get() ?? '');
      },
    });
  };
};

export type WithSelected<T> = {
  selectById: (id: string) => void;
  selectedId: Mobx.IComputedValue<string | null>;
  selectedItem: Mobx.IComputedValue<T | null>;
};

export const withFiltered = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const filter = Mobx.observable.box<string | null>(null);

    const api = {
      ...(store as EntityStore<T> & U),
      filter: Mobx.computed(() => filter.get()),
      filteredItems: Mobx.computed(() => {
        const value = filter.get();
        return value
          ? store.list.get().filter((item) => item.id.includes(value))
          : store.list.get();
      }),
      setFilter: Mobx.action((value: string) => filter.set(value)),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        filter.set(other.filter.get());
      },
    });
  };
};

export type WithFiltered<T> = {
  filter: Mobx.IComputedValue<string | null>;
  filteredItems: Mobx.IComputedValue<T[]>;
  setFilter: (value: string) => void;
};
