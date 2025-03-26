export const mapToDictionary = <T, R>(
  keys: string[],
  mapFn: (item: T) => R,
  source: T[]
) =>
  keys.reduce<Record<string, R>>((acc, key, index) => {
    acc[key] = mapFn(source[index]);
    return acc;
  }, {});
