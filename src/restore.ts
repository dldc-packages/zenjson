import type { CustomTypes, RestoreContext } from './types';
import { defaultTypes, validateTypes, isSanitizedTuple } from './types';
import { isPlainObject, mapObject } from './utils';

export function createRestore(customTypes: CustomTypes): typeof restore {
  validateTypes(customTypes);
  return function restore(data: unknown): unknown {
    return restoreInternal(data, customTypes);
  };
}

export function restore(data: unknown): unknown {
  return restoreInternal(data, defaultTypes);
}

function restoreInternal(data: unknown, customTypes: CustomTypes): unknown {
  const validTypes = customTypes.map((t) => t.name);
  const restoreCtx: RestoreContext = {
    validTypes,
    restore: (val) => tranverse(val),
  };
  function tranverse(item: unknown): unknown {
    if (isSanitizedTuple(item, validTypes)) {
      const [typeName, sanitized] = item;
      const type = customTypes.find((t) => t.name === typeName);
      if (!type) {
        throw new Error('Unepected: custom type not found');
      }
      return type.restore(sanitized, restoreCtx);
    }
    if (Array.isArray(item)) {
      return item.map((v) => tranverse(v));
    }
    if (isPlainObject(item)) {
      return mapObject(item, (v) => tranverse(v));
    }
    return item;
  }
  return tranverse(data);
}
