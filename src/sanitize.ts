import type { CheckContext, CustomTypes, SanitizeContext } from './types';
import { defaultTypes, validateTypes } from './types';
import { isPlainObject, mapObject } from './utils';

export function createSanitize(customTypes: CustomTypes): typeof sanitize {
  validateTypes(customTypes);
  return function sanitize(data: unknown): unknown {
    return sanitizeInternal(data, customTypes);
  };
}

export function sanitize(data: unknown): unknown {
  return sanitizeInternal(data, defaultTypes);
}

function sanitizeInternal(data: unknown, customTypes: CustomTypes): unknown {
  const validTypes = customTypes.map((t) => t.name);
  const checkCtx: CheckContext = {
    validTypes,
  };
  const sanitizeCtx: SanitizeContext = {
    validTypes,
    sanitize: (val) => tranverse(val),
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
