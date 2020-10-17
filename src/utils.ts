/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types */

import { FieldElement } from "./types";

export const warn = (...args: any[]): void => {
  if (__DEV__) console.warn(...args);
};

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
  !isArray(value) && value !== null && typeof value === "object";

export const isEmptyObject = (value: unknown): value is Record<string, never> =>
  isObject(value) && !Object.keys(value).length;

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

// const isKey = (value: string) =>
//   !isArray(value) &&
//   (/^\w*$/.test(value) ||
//     !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value));

export const get = (object: any, path: string, defaultValue?: unknown): any => {
  if (!isObject(object)) return defaultValue;

  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};

export const set = (
  object: any,
  path: string,
  value?: unknown
): typeof object => {
  if (!isObject(object)) return object;

  const tempPath: string[] = [];
  path.replace(
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    (
      match: string,
      expression: string,
      quote: string,
      subString: string
    ): any => {
      tempPath.push(
        quote ? subString.replace(/\\(\\)?/g, "$1") : expression || match
      );
    }
  );

  const cloneObject = { ...object };
  tempPath.slice(0, -1).reduce((obj: Record<string, any>, key, idx) => {
    if (isObject(obj[key]) || isArray(obj[key])) return obj[key];
    const next = Number(tempPath[idx + 1]);
    obj[key] = Number.isInteger(next) && next >= 0 ? [] : {};
    return obj[key];
  }, cloneObject)[tempPath[tempPath.length - 1]] = value;

  return cloneObject;
};

export const deepMerge = (...objects: Record<string, any>[]) =>
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
