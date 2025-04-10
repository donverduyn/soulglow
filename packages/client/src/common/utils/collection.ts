import { makeAutoObservable } from 'mobx';
import { TypenameInModule, type ModuleName } from '__generated/gql/modules';
import { EntityStore } from './entity';

type Constructor<T> = new (...args: any[]) => T;

export type EntityMapping<M extends ModuleName> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in TypenameInModule<M>]: new (...args: any[]) => any;
};

export class EntityStoreCollection<
  T extends Record<string, Constructor<{ id: string }>>,
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

  normalize(data: unknown): unknown {
    if (Array.isArray(data)) return data.map((item) => this.normalize(item));

    if (
      data &&
      typeof data === 'object' &&
      '__typename' in data &&
      'id' in data
    ) {
      const { __typename } = data as { __typename: string; id: string };
      const typename = __typename.toLowerCase() as keyof T;

      const Ctor = this.entityMapping[typename];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!Ctor) {
        return data;
      }

      const instance = new Ctor(data);
      this.stores[typename].add(instance as InstanceType<T[keyof T]>);
      return instance;
    }

    if (data && typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const key in data) {
        result[key] = this.normalize(data[key as keyof typeof data]);
      }
      return result;
    }

    return data;
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
