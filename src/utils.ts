/* eslint-disable @typescript-eslint/ban-types */

import { FieldElement } from "./types";

export const warn = (...args: any[]): void => {
  if (__DEV__) console.warn(args);
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

export const get = (
  object: Record<string, any>,
  path: string,
  defaultValue?: unknown
): any => {
  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};

export const set = (
  object: Record<string, any>,
  path: string,
  value: unknown
): typeof object => {
  if (!isObject(object)) return object;

  const temp = path.toString().match(/[^.[\]]+/g) || [];
  temp
    .slice(0, -1)
    .reduce(
      (obj: Record<string, any>, key: string) =>
        isObject(obj[key]) ? obj[key] : {},
      object
    )[temp[temp.length - 1]] = value;

  return object;
};
