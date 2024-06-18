import { action, computed, observable, type IComputedValue } from 'mobx';

interface Identifiable {
  id: string;
}

interface EntityStore<T extends Identifiable> {
  add: (entity: T) => void;
  count: IComputedValue<number>;
  get: (id: string) => T | null;
  list: IComputedValue<T[]>;
  remove: (id: string) => void;
  update: (id: string, newEntity: T) => void;
}

// The key here, is that we infer the previous type as U through the parameter of merge. By intersecting with the inferred generic, we can compose any additional added properties.

type WithPrevious<T> = T & {
  merge: (other: T) => void;
};

export const withSelected = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const selectedId = observable.box<string | null>(null);

    const api = {
      ...(store as EntityStore<T> & U),
      select: action((id: string) => selectedId.set(id)),
      selectedId: computed(() => selectedId.get()),
      selectedItem: computed(() => store.get(selectedId.get() ?? '')),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        selectedId.set(other.selectedId.get());
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

export const createEntityStore = <T extends Identifiable>() => {
  const store = observable.map<string, T>();

  const api: EntityStore<T> = {
    add: action((entity) => store.set(entity.id, entity)),
    count: computed(() => store.size),
    get: (id) => store.get(id) ?? null,
    list: computed(() => Array.from(store.values())),
    remove: action((id) => store.delete(id)),
    update: action((id, newEntity) => store.set(id, newEntity)),
  };

  return Object.assign(api, {
    merge: (other: typeof api) => {
      other.list.get().forEach((item) => api.add(item));
    },
  });
};
