import { pipe } from 'effect';
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

type WithMerge<T> = T & { merge: (other: T) => void };

export const withSelected = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithMerge<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const selectedId = observable.box<string | null>(null);

    const api = {
      ...store,
      select: action((id: string) => selectedId.set(id)),
      selectedId: computed(() => selectedId.get()),
      selectedItem: computed(() => store.get(selectedId.get() ?? '')),
    };

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other as U);
        selectedId.set(other.selectedId.get());
      },
    });
  };
};

export const withFiltered = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithMerge<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const filter = observable.box<string | null>(null);

    const api = {
      ...store,
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
        merge(other as U);
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
      other.list.get().forEach((entity) => store.set(entity.id, entity));
    },
  })
};

const test = pipe(
  createEntityStore<{ id: string, value: boolean }>,
  withSelected,
  withFiltered
)()


// think about merging set and lazyGet into entity store?
