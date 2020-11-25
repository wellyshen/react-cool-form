/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types */

import { useEffect, useLayoutEffect } from "react";

import { FieldElement, Map } from "./types";

export const warn = (...args: any[]): void => {
  if (__DEV__) console.warn(...args);
};

export const useUniversalLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export const runWithLowPriority = (callback: (args: any) => any) =>
  (
    window.requestIdleCallback ||
    ((callback) => {
      const start = Date.now();
      return setTimeout(
        () =>
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          }),
        1
      );
    })
  )(callback, { timeout: 2000 });

export const arrayToMap = (arr: any[]): Map =>
  arr.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});

export const isFieldElement = (element: HTMLElement): element is FieldElement =>
  /INPUT|TEXTAREA|SELECT/.test(element.tagName);

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

export const isFileList = (value: unknown): value is FileList =>
  value instanceof FileList;

export const filterError = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error) || error instanceof Date)
    return touched ? error : undefined;

  return Object.keys(error).reduce((obj: Record<string, any>, key) => {
    obj[key] = filterError(
      (error as Record<string, any>)[key],
      (touched as Record<string, any>)[key]
    );
    return obj;
  }, {});
};

export const get = (object: any, path: string, defaultValue?: unknown) => {
  if (!isPlainObject(object) || !path) return defaultValue;

  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};

const cloneObject = (object: unknown): any => {
  if (!isObject(object) || isFileList(object)) return object;

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
