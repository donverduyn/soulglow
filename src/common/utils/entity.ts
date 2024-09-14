import { action, computed, observable, type IComputedValue } from 'mobx';
import { v4 as uuid } from 'uuid';
interface Identifiable {
  id: string;
}

interface EntityStore<T extends Identifiable> {
  add: (entity: T) => void;
  count: IComputedValue<number>;
  get: (id: string) => T | null;
  id: string;
  indexOf: (id: string) => number;
  list: IComputedValue<T[]>;
  remove: (id: string) => void;
  update: (id: string, map: (current: T) => void) => void;
}

// TODO: we might want to consider a composable crud mapper, that allows to map actions on a certain entity to a store instance using an effect. This way, if we need to share state between different modules, we can fetch and populate from a single source. By combining this with global event replays, we can restore previous state on a component remount, if this is not synced on the backend.

export const createEntityStore = <T extends Identifiable>() => {
  const store = observable.map<string, T>([], {
    proxy: false,
  });

  const api: EntityStore<T> = {
    add: action((entity) => store.set(entity.id, entity)),
    count: computed(() => store.size),
    get: (id) => store.get(id) ?? null,
    id: uuid(),
    indexOf: (id: string) => Array.from(store.keys()).indexOf(id),
    list: computed(() => Array.from(store.values())),
    remove: action((id) => store.delete(id)),
    update: action((id, mapFn) => mapFn(store.get(id)!)),
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

type WithPrevious<T> = T & {
  merge: (other: T) => void;
};

export const withSelected = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const id = observable.box<string | null>(null);

    const api = {
      ...(store as EntityStore<T> & U),
      selectById: action((value: string) => id.set(value)),
      selectedId: computed(() => id.get()),
      selectedItem: computed(() => store.get(id.get() ?? '')),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        // api.selectById(other.selectedId.get() ?? '');
      },
    });
  };
};

export const withFiltered = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const filter = observable.box<string | null>(null);

    const api = {
      ...(store as EntityStore<T> & U),
      filter: computed(() => filter.get()),
      filteredItems: computed(() => {
        const value = filter.get();
        return value
          ? store.list.get().filter((item) => item.id.includes(value))
          : store.list.get();
      }),
      setFilter: action((value: string) => filter.set(value)),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        filter.set(other.filter.get());
      },
    });
  };
};
