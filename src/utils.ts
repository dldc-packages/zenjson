function isObject(o: unknown): o is object {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o: unknown): o is Record<string, unknown> {
  if (isObject(o) === false) {
    return false;
  }

  // If has modified constructor
  const ctor = (o as any).constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if ((prot as any).hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export function mapObject(
  obj: Record<string, any>,
  mapper: (v: any, key: string) => any
): Record<string, any> {
  const res: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    res[key] = mapper(val, key);
  }
  return res;
}
