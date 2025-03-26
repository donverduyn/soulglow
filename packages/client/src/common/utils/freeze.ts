import { isPlainObject } from 'remeda';

export function freeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] === 'object' && !Object.isFrozen(value[i])) {
        freeze(value[i]);
      }
    }
  } else if (isPlainObject(value)) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(value);

    // Freeze properties before freezing self
    for (const name of propNames) {
      const prop = value[name as keyof typeof value];

      // If value is an object and not already frozen, freeze it recursively
      if (prop && typeof prop === 'object' && !Object.isFrozen(prop)) {
        freeze(prop);
      }
    }

    return Object.freeze(value);
  }
  return value;
}
