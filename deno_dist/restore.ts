import { CustomTypes, defaultTypes, RestoreContext, validateTypes } from './types.ts';
import { isPlainObject, mapObject } from './utils.ts';

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
    if (item && Array.isArray(item) && item.length === 2) {
      const [typeName, sanitized] = item;
      const type = customTypes.find((t) => t.name === typeName);
      if (!type) {
        return item.map((v) => tranverse(v));
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
