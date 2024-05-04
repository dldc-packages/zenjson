import type { ITypedMap } from "./typedMap.ts";
import { createTypedMap } from "./typedMap.ts";
import type { ICheckContext, ISanitizeContext, TCustomTypes } from "./types.ts";
import { defaultTypes, validateTypes } from "./types.ts";
import { isPlainObject, mapObject } from "./utils.ts";

export function createSanitize(customTypes: TCustomTypes): typeof sanitize {
  validateTypes(customTypes);
  return function sanitize(data: unknown, state?: ITypedMap): unknown {
    return sanitizeInternal(data, customTypes, state);
  };
}

export function sanitize(data: unknown, state?: ITypedMap): unknown {
  return sanitizeInternal(data, defaultTypes, state);
}

function sanitizeInternal(
  data: unknown,
  customTypes: TCustomTypes,
  state: ITypedMap = createTypedMap(),
): unknown {
  const validTypes = customTypes.map((t) => t.name);
  const checkCtx: ICheckContext = {
    validTypes,
    state,
  };
  const sanitizeCtx: ISanitizeContext = {
    validTypes,
    sanitize: (val) => tranverse(val),
    state,
  };
  function tranverse(item: unknown): unknown {
    const type = customTypes.find((t) => t.check(item, checkCtx));
    if (type) {
      return [type.name, type.sanitize(item, sanitizeCtx)];
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
