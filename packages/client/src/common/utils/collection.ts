import { makeAutoObservable, runInAction } from 'mobx';
import { TypenameInModule, type ModuleName } from '__generated/gql/modules';
import { EntityStore } from './entity';

type Constructor<T> = new (...args: any[]) => T;

export type EntityMapping<M extends ModuleName> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in TypenameInModule<M>]: new (...args: any[]) => any;
};

export class EntityStoreCollection<
  T extends Record<string, Constructor<{ id: string; updatedAt: string }>>,
> {
  private stores: {
    [K in keyof T]: EntityStore<InstanceType<T[K]>>;
  };

  constructor(public entityMapping: T) {
    this.stores = Object.keys(entityMapping).reduce<
      Record<keyof T, EntityStore<InstanceType<T[keyof T]>>>
    >((acc, key) => {
      acc[key as keyof typeof acc] = new EntityStore<
        InstanceType<T[typeof key]>
      >();
      return acc;
    }, {} as never);

    makeAutoObservable(this, { entityMapping: false });
  }

  private _normalize(
    data: unknown,
    idBuckets: Record<keyof T, string[]>
  ): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this._normalize(item, idBuckets));
    }

    if (
      data &&
      typeof data === 'object' &&
      '__typename' in data &&
      'id' in data
    ) {
      const { __typename, id } = data as { __typename: string; id: string };
      const typename = __typename.toLowerCase() as keyof T;
      const Ctor = this.entityMapping[typename];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!Ctor) return data;

      const store = this.stores[typename];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      idBuckets[typename] ??= [];
      idBuckets[typename].push(id);

      const existing = store.get(id);
      if (existing) {
        if (existing.updatedAt !== (data as { updatedAt?: string }).updatedAt) {
          store.update(id, data);
        }
        return existing;
      } else {
        const instance = new Ctor(data);
        store.add(instance as InstanceType<T[keyof T]>);
        return instance;
      }
    }

    if (data && typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const key in data) {
        result[key] = this._normalize(
          data[key as keyof typeof data],
          idBuckets
        );
      }
      return result;
    }

    return data;
  }

  normalizeWithPurge(data: unknown) {
    let result: unknown;
    runInAction(() => {
      const idBuckets: Record<keyof T, string[]> = {} as never;
      const normalized = this._normalize(data, idBuckets);
      result = normalized;

      // Purge all stores based on what was seen
      for (const typename in this.stores) {
        const store = this.stores[typename];
        const keepIds = idBuckets[typename as keyof T] ?? [];
        store.purge(keepIds);
      }
    });
    return result;
  }

  private loadingState: Record<keyof T, boolean> = {} as never;
  isLoading<K extends keyof T>(typename: K): boolean {
    return this.loadingState[typename];
  }

  setIsLoading<K extends keyof T>(typename: K, loading: boolean): void {
    this.loadingState[typename] = loading;
  }

  get<K extends keyof T>(typename: K, id: string): InstanceType<T[K]> | null {
    return this.stores[typename].get(id);
  }

  all<K extends keyof T>(typename: K): InstanceType<T[K]>[] {
    return this.stores[typename].list;
  }

  getStore<K extends keyof T>(typename: K): EntityStore<InstanceType<T[K]>> {
    return this.stores[typename];
  }
}
