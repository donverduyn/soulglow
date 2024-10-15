import { freeze } from './freeze';

// Helper function to check if an object is recursively frozen
function isDeepFrozen<T extends Record<string, unknown> | unknown[]>(
  obj: T
): boolean {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && !isDeepFrozen(item as T)) return false;
    }
  } else {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !isDeepFrozen(obj[key] as T))
        return false;
    }
  }
  return true;
}

describe('freeze', () => {
  it('should freeze an object', () => {
    expect.assertions(1);
    const object = { nested: { prop: 'value' }, prop: 'value' };
    freeze(object);

    expect(isDeepFrozen(object)).toBeTruthy();
  });
  it('should freeze an array', () => {
    expect.assertions(1);
    const array = [{ prop: 'value' }, { prop: 'value' }];
    freeze(array);

    expect(isDeepFrozen(array)).toBeTruthy();
  });
});
