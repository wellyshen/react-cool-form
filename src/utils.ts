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

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

export const get = (object: any, path: string, defaultValue?: unknown): any => {
  if (!isObject(object)) return defaultValue;

  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};

const isKey = (value: string) =>
  !isArray(value) &&
  (/^\w*$/.test(value) ||
    !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value));

const stringToPath = (value: string) => {
  const result: string[] = [];

  value.replace(
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    (
      match: string,
      expression: string,
      quote: string,
      subString: string
    ): any => {
      result.push(
        quote ? subString.replace(/\\(\\)?/g, "$1") : expression || match
      );
    }
  );

  return result;
};

export const set = (
  object: any,
  path: string,
  value: unknown
): typeof object => {
  if (!isObject(object)) return object;

  const tempPath = isKey(path) ? [path] : stringToPath(path);
  tempPath.slice(0, -1).reduce((obj: Record<string, any>, key, idx) => {
    if (isObject(obj[key]) || isArray(obj[key])) return obj[key];
    const next = Number(tempPath[idx + 1]);
    obj[key] = Number.isInteger(next) && next >= 0 ? [] : {};
    return obj[key];
  }, object)[tempPath[tempPath.length - 1]] = value;

  return object;
};
