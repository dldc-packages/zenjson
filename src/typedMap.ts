import { throwKeyNotFound } from "./erreur.ts";

const TYPED_KEY = Symbol("TYPED_KEY");

export interface ITypedKey<T> {
  readonly [TYPED_KEY]: T;
  readonly name: string;
}

export function createTypedKey<T>(name: string): ITypedKey<T> {
  return {
    [TYPED_KEY]: undefined as unknown as T,
    name,
  };
}

export interface ITypedMap {
  get<T>(key: ITypedKey<T>): T | undefined;
  getOrDefault<T>(key: ITypedKey<T>, defaultValue: T): T;
  getOrFail<T>(key: ITypedKey<T>): T;
  set<T>(key: ITypedKey<T>, value: T): void;
  has<T>(key: ITypedKey<T>): boolean;
  delete<T>(key: ITypedKey<T>): void;
  update<T>(key: ITypedKey<T>, updater: (value: T | undefined) => T): void;
  updateOrFail<T>(key: ITypedKey<T>, updater: (value: T) => T): void;
  updateOrDefault<T>(
    key: ITypedKey<T>,
    defaultValue: T,
    updater: (value: T) => T,
  ): void;
}

export function createTypedMap(): ITypedMap {
  // deno-lint-ignore no-explicit-any
  const data = new WeakMap<ITypedKey<any>, unknown>();

  return {
    get,
    getOrDefault,
    getOrFail,
    set,
    has,
    delete: deleteKey,
    update,
    updateOrFail,
    updateOrDefault,
  };

  function get<T>(key: ITypedKey<T>): T | undefined {
    return data.get(key) as T | undefined;
  }

  function getOrDefault<T>(key: ITypedKey<T>, defaultValue: T): T {
    const value = get(key);
    return value === undefined ? defaultValue : value;
  }

  function getOrFail<T>(key: ITypedKey<T>): T {
    const value = get(key);
    if (value === undefined) {
      return throwKeyNotFound(key.name);
    }
    return value;
  }

  function set<T>(key: ITypedKey<T>, value: T): void {
    data.set(key, value);
  }

  function has<T>(key: ITypedKey<T>): boolean {
    return data.has(key);
  }

  function deleteKey<T>(key: ITypedKey<T>): void {
    data.delete(key);
  }

  function update<T>(
    key: ITypedKey<T>,
    updater: (value: T | undefined) => T,
  ): void {
    set(key, updater(get(key)));
  }

  function updateOrFail<T>(key: ITypedKey<T>, updater: (value: T) => T): void {
    set(key, updater(getOrFail(key)));
  }

  function updateOrDefault<T>(
    key: ITypedKey<T>,
    defaultValue: T,
    updater: (value: T) => T,
  ): void {
    set(key, updater(getOrDefault(key, defaultValue)));
  }
}
