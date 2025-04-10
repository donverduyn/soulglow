import * as Mobx from 'mobx';
import { v4 as uuid } from 'uuid';

export interface Crudable<T extends Identifiable & { updatedAt: string }> {
  add: (entity: T) => void;
  count: Mobx.IComputedValue<number>;
  get: (id: string) => T | null;
  id: string;
  indexOf: (id: string) => number;
  list: Mobx.IComputedValue<T[]>;
  purge: (validIds: string[]) => void;
  remove: (id: string) => void;
  update: (id: string, newProperties: Partial<T>) => void;
}

// TODO: we might want to consider a composable crud mapper, that allows to map actions on a certain entity to a store instance using an effect. This way, if we need to share state between different modules, we can fetch and populate from a single source. By combining this with global event replays, we can restore previous state on a component remount, if this is not synced on the backend.

export class EntityStore<T extends Identifiable> {
  store = new Map<string, T>();
  id = uuid();

  constructor() {
    Mobx.makeAutoObservable(this);
  }

  add(entity: T) {
    this.store.set(entity.id, entity);
  }

  get count() {
    return this.store.size;
  }

  get(id: string): T | null {
    return this.store.get(id) ?? null;
  }

  indexOf(id: string): number {
    return Array.from(this.store.keys()).indexOf(id);
  }

  get list(): T[] {
    return Array.from(this.store.values());
  }

  remove(id: string) {
    this.store.delete(id);
  }

  // Example of a method that could be used to update specific properties of an entity
  update(id: string, newProperties: Partial<T>) {
    const entity = this.store.get(id);
    if (entity) {
      // Only update properties that are different
      Object.keys(newProperties).forEach((key) => {
        if (entity[key as keyof T] !== newProperties[key as keyof T]) {
          entity[key as keyof T] = newProperties[key as keyof T]!; // Update the property
        }
      });
    }
  }

  // Purge entities that are not in the provided list of IDs
  purge(validIds: string[]) {
    const allEntities = this.list; // Get all entities
    const entitiesToRemove = allEntities.filter(
      (entity) => !validIds.includes(entity.id)
    );

    // Remove the entities that are no longer valid
    entitiesToRemove.forEach((entity) => this.remove(entity.id));
  }

  merge(other: EntityStore<T>) {
    other.list.forEach((item) => this.add(item));
  }

  // onBecomeObserved(store, () => {
  //   console.log('observed', api.id);
  // });
  // onBecomeUnobserved(store, () => {
  //   console.log('unobserved', api.id);
  // });
}

// We infer the previous type as U through the parameter of merge. By intersecting with the inferred generic, we can compose any additional added properties. TypeScript automaticallly deduplicates the overlapping properties from Entitystore<T> which is part of the inferred generic U.

export type Mergable<T> = T & {
  merge: (other: T) => void;
};

export const WithSelected = <
  TBase extends new (...args: any[]) => EntityStore<T>,
  T extends Identifiable,
>(
  Base: TBase
) => {
  return class WithSelectedStore extends Base {
    selectedId = Mobx.observable.box<string | null>(null);

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
      Mobx.makeObservable(this, {
        selectById: Mobx.action,
        selectedId: Mobx.observable,
        selectedItem: Mobx.computed,
      });
    }

    selectById(value: string) {
      this.selectedId.set(value);
    }

    get selectedItem() {
      return this.get(this.selectedId.get() ?? '') ?? null;
    }
  };
};
// export const withSelected = <T extends Identifiable & { updatedAt: string }, U>(
//   createStore: () => Crudable<T> & Mergable<U>
// ) => {
//   return () => {
//     const { merge, ...store } = createStore();
//     const id = Mobx.observable.box<string | null>(null);

//     const api = {
//       ...(store as Crudable<T> & U),
//       selectById: Mobx.action((value: string) => id.set(value)),
//       selectedId: Mobx.computed(() => id.get()),
//       selectedItem: Mobx.computed(() => store.get(id.get() ?? '')),
//     };

//     return Object.assign(api, {
//       merge: (other: typeof api) => {
//         merge(other);
//         // api.selectById(other.selectedId.get() ?? '');
//       },
//     });
//   };
// };

// TODO: selectable state should be state related to the user entity itself.
// TODO: users and entities are assumed to have many to many relationships and keep references to each other.

export type Selectable<T> = {
  selectById: (id: string) => void;
  selectedId: Mobx.IComputedValue<string | null>;
  selectedItem: Mobx.IComputedValue<T | null>;
};

export const withFiltered = <T extends Identifiable & { updatedAt: string }, U>(
  createStore: () => Crudable<T> & Mergable<U>
) => {
  return () => {
    const { merge, ...store } = createStore();
    const filter = Mobx.observable.box<string | null>(null);

    const api = {
      ...(store as Crudable<T> & U),
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

export type Filterable<T> = {
  filter: Mobx.IComputedValue<string | null>;
  filteredItems: Mobx.IComputedValue<T[]>;
  setFilter: (value: string) => void;
};
