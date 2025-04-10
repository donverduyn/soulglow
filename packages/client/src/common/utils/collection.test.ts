/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable vitest/prefer-expect-assertions */
import { EntityStoreCollection } from './collection';

class EndpointEntity {
  id: string;
  constructor(data: { id: string }) {
    this.id = data.id;
  }
}

class UserEntity {
  id: string;
  constructor(data: { id: string }) {
    this.id = data.id;
  }
}

const createStore = () =>
  new EntityStoreCollection({
    endpoint: EndpointEntity,
    user: UserEntity,
  });

describe('entityStoreCollection', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('normalizes a single object', () => {
    const raw = { __typename: 'endpoint', id: '1' };
    const result = store.normalize(raw);

    expect(result).toBeInstanceOf(EndpointEntity);
    expect(store.get('endpoint', '1')).toBeInstanceOf(EndpointEntity);
  });

  it('normalizes an array of objects', () => {
    const raw = [
      { __typename: 'endpoint', id: 'a' },
      { __typename: 'user', id: 'u1' },
    ];
    const result = store.normalize(raw);

    expect(Array.isArray(result)).toBeTruthy();
    expect(store.get('endpoint', 'a')).toBeInstanceOf(EndpointEntity);
    expect(store.get('user', 'u1')).toBeInstanceOf(UserEntity);
  });

  it('normalizes nested structures', () => {
    const nested = {
      list: [
        { __typename: 'endpoint', id: 'nested1' },
        { __typename: 'user', id: 'nested2' },
      ],
    };

    const result = store.normalize(nested) as {
      list: (EndpointEntity | UserEntity)[];
    };

    expect(result.list[0]).toBeInstanceOf(EndpointEntity);
    expect(result.list[1]).toBeInstanceOf(UserEntity);
    expect(store.get('endpoint', 'nested1')).not.toBeNull();
    expect(store.get('user', 'nested2')).not.toBeNull();
  });

  it('ignores unknown typenames', () => {
    const result = store.normalize({
      __typename: 'unknown',
      id: 'x',
    });

    expect(result).toStrictEqual({ __typename: 'unknown', id: 'x' });
  });

  it('can fetch all instances of a type', () => {
    store.normalize([
      { __typename: 'endpoint', id: 'e1' },
      { __typename: 'endpoint', id: 'e2' },
    ]);

    const list = store.all('endpoint');
    expect(list).toHaveLength(2);
    expect(list[0]).toBeInstanceOf(EndpointEntity);
  });

  it('getStore returns correct store instance', () => {
    const endpointStore = store.getStore('endpoint');
    endpointStore.add(new EndpointEntity({ id: 'manual' }));

    const result = store.get('endpoint', 'manual');
    expect(result).toBeInstanceOf(EndpointEntity);
  });
});
