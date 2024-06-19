import {
  action,
  computed,
  observable,
  reaction,
  type IComputedValue,
} from 'mobx';

interface Identifiable {
  id: string;
}

interface EntityStore<T extends Identifiable> {
  add: (entity: T) => void;
  count: IComputedValue<number>;
  get: (id: string) => T | null;
  indexOf: (id: string) => number;
  list: IComputedValue<T[]>;
  remove: (id: string) => void;
  update: (id: string, newEntity: T) => void;
}

export const createEntityStore = <T extends Identifiable>() => {
  const store = observable.map<string, T>();

  const api: EntityStore<T> = {
    add: action((entity) => store.set(entity.id, entity)),
    count: computed(() => store.size),
    get: (id) => store.get(id) ?? null,
    indexOf: (id: string) => Array.from(store.keys()).indexOf(id),
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

// We infer the previous type as U through the parameter of merge. By intersecting with the inferred generic, we can compose any additional added properties. TypeScript automaticallly deduplicates the overlapping properties from Entitystore<T> which is part of the inferred generic U.

type WithPrevious<T> = T & {
  merge: (other: T) => void;
};

export const withSelected = <T extends Identifiable, U>(
  createStore: () => EntityStore<T> & WithPrevious<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const index = observable.box<number>(0);

    const api = {
      ...(store as EntityStore<T> & U),
      select: action((i: number) => index.set(i)),
      selectedIndex: computed(() => index.get()),
      selectedItem: computed(() => store.list.get()[index.get()] ?? null),
    };

    const selectAlternative = (item: T | null) => {
      const prevIndex = index.get() - 1;
      if (!item && prevIndex >= 0) {
        api.select(prevIndex);
      }
    };

    // TODO: create dispose chain for entity store and decorators
    // TODO: select the previous index if one item above is removed
    const dispose = reaction(
      api.selectedItem.get.bind(api.selectedItem),
      selectAlternative
    );

    return Object.assign(api, {
      merge: (other: typeof api) => {
        merge(other);
        api.select(other.selectedIndex.get());
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
