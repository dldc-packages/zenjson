function isObject(o: unknown): o is object {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isPlainObject(o: unknown): o is Record<string, unknown> {
  if (isObject(o) === false) {
    return false;
  }

  // If has modified constructor
  // deno-lint-ignore no-explicit-any
  const ctor = (o as any).constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export function mapObject(
  obj: Record<string, unknown>,
  mapper: (v: unknown, key: string) => unknown,
): Record<string, unknown> {
  const res: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    res[key] = mapper(val, key);
  }
  return res;
}
