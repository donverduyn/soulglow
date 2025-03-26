import { mapToDictionary } from './array';

describe('mapToDictionary', () => {
  it('should map an array to a dictionary using the provided keys and map function', () => {
    expect.hasAssertions();
    const keys = ['a', 'b', 'c'];
    const source = ['1', '2', '3'];
    const mapFn = (item: string) => item;

    const result = mapToDictionary(keys, mapFn, source);

    // eslint-disable-next-line vitest/prefer-strict-equal
    expect(result).toEqual({
      a: '1',
      b: '2',
      c: '3',
    });
  });
});
