import type { ITypedMap } from './typedMap';
import { createTypedMap } from './typedMap';
import type { IRestoreContext, TCustomTypes } from './types';
import { defaultTypes, isSanitizedTuple, validateTypes } from './types';
import { isPlainObject, mapObject } from './utils';

export function createRestore(customTypes: TCustomTypes): typeof restore {
  validateTypes(customTypes);
  return function restore(data: unknown, state?: ITypedMap): unknown {
    return restoreInternal(data, customTypes, state);
  };
}

export function restore(data: unknown, state?: ITypedMap): unknown {
  return restoreInternal(data, defaultTypes, state);
}

function restoreInternal(data: unknown, customTypes: TCustomTypes, state: ITypedMap = createTypedMap()): unknown {
  const validTypes = customTypes.map((t) => t.name);
  const restoreCtx: IRestoreContext = {
    validTypes,
    restore: (val) => tranverse(val),
    state,
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
