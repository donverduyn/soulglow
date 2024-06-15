import { action, computed, observable, type IComputedValue } from 'mobx';

interface Identifiable {
  id: string;
}

export type EntityStore<T extends Identifiable> = {
  add: (entity: T) => void;
  count: IComputedValue<number>;
  get: (id: string) => T | null;
  list: IComputedValue<T[]>;
  remove: (id: string) => void;
  update: (id: string, newEntity: T) => void;
};

export type WithSelected<T> = {
  select: (id: string) => void;
  selectedId: IComputedValue<string | null>;
  selectedItem: IComputedValue<T | null>;
};

export const withSelected = <T extends Identifiable>(
  createStore: () => EntityStore<T>
) => {
  const store = createStore();
  const selectedId = observable.box<string | null>(null);

  return {
    ...store,
    select: action((id: string) => selectedId.set(id)),
    selectedId: computed(() => selectedId.get()),
    selectedItem: computed(() => store.get(selectedId.get() ?? '')),
  };
};

export const createEntityStore = <T extends Identifiable>(): EntityStore<T> => {
  const store = observable.map<string, T>();

  return {
    add: action((entity) => store.set(entity.id, entity)),
    count: computed(() => store.size),
    get: (id) => store.get(id) ?? null,
    list: computed(() => Array.from(store.values())),
    remove: action((id) => store.delete(id)),
    update: action((id, newEntity) => store.set(id, newEntity)),
  };
};

// think about merging set and lazyGet into entity store?
