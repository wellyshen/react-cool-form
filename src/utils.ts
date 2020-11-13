/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types */

import { FieldElement } from "./types";

export const warn = (...args: any[]): void => {
  if (__DEV__) console.warn(...args);
};

export const arrayToMap = (arr: any[]): Record<string, boolean> =>
  arr.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});

export const isNumberField = (field: FieldElement): field is HTMLInputElement =>
  field.type === "number";

export const isRangeField = (field: FieldElement): field is HTMLInputElement =>
  field.type === "range";

export const isCheckboxField = (
  field: FieldElement
): field is HTMLInputElement => field.type === "checkbox";

export const isRadioField = (field: FieldElement): field is HTMLInputElement =>
  field.type === "radio";

export const isFileField = (field: FieldElement): field is HTMLInputElement =>
  field.type === "file";

export const isMultipleSelectField = (
  field: FieldElement
): field is HTMLSelectElement => field.type === "select-multiple";

export const isFunction = (value: unknown): value is Function =>
  typeof value === "function";

export const isArray = (value: unknown): value is any[] => Array.isArray(value);

export const isObject = (value: unknown): value is Object =>
  value !== null && typeof value === "object";

export const isPlainObject = (value: unknown): value is Object =>
  !isArray(value) && isObject(value);

export const isEmptyObject = (value: unknown): value is Record<string, never> =>
  isPlainObject(value) && !Object.keys(value).length;

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

export const isKey = (value: string) =>
  !isArray(value) &&
  (/^\w*$/.test(value) ||
    !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value));

export const get = (object: any, path: string, defaultValue?: unknown) => {
  if (!isPlainObject(object) || !path) return defaultValue;

  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};

const cloneObject = (object: unknown): any => {
  if (!isObject(object)) return object;

  if (object instanceof Date) return new Date(object.getTime());

  if (isArray(object)) return object.map((val) => cloneObject(val));

  if (isObject(object))
    return Object.keys(object).reduce((obj: Record<string, any>, key) => {
      obj[key] = cloneObject((object as Record<string, any>)[key]);
      return obj;
    }, {});

  throw new Error("Unable to clone object.");
};

export const set = (
  object: any,
  path: string,
  value: unknown,
  immutable = false
) => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const segs = String(path)
    .split(/[.[\]]+/)
    .filter(Boolean);
  const newObject = immutable ? cloneObject(object) : object;

  segs.slice(0, -1).reduce((obj, key, idx) => {
    if (isObject(obj[key])) return obj[key];
    const next = Number(segs[idx + 1]);
    obj[key] = Number.isInteger(next) && next >= 0 ? [] : {};
    return obj[key];
  }, newObject)[segs[segs.length - 1] || ""] = value;

  return newObject;
};

export const unset = (object: any, path: string, immutable = false) => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const refObject = immutable ? cloneObject(object) : object;
  let newObject = refObject;

  // eslint-disable-next-line no-prototype-builtins
  if (newObject.hasOwnProperty(path)) {
    delete newObject[path];
    return refObject;
  }

  if (!isUndefined(get(newObject, path))) {
    const segs = path.split(".");
    let last = segs.pop() as string;

    while (segs.length && segs[segs.length - 1].slice(-1) === "\\")
      last = `${(segs.pop() as string).slice(0, -1)}.${last}`;

    while (segs.length) newObject = newObject[(path = segs.shift() as string)];

    delete newObject[last];
  }

  return refObject;
};

export const deepMerge = (...objects: any[]) =>
  objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const prevValue = prev[key];
      const currValue = obj[key];

      if (isArray(prevValue) && isArray(currValue)) {
        prev[key] = [...prevValue, ...currValue];
      } else if (isObject(prevValue) && isObject(currValue)) {
        prev[key] = deepMerge(prevValue, currValue);
      } else {
        prev[key] = currValue;
      }
    });

    return prev;
  }, {});
