import { FieldElement } from "./types";

export const isNumberField = ({ type }: FieldElement): boolean =>
  type === "number";

export const isRangeField = ({ type }: FieldElement): boolean =>
  type === "range";

export const isCheckboxField = ({ type }: FieldElement): boolean =>
  type === "checkbox";

export const isRadioField = ({ type }: FieldElement): boolean =>
  type === "radio";

export const isMultipleSelectField = ({ type }: FieldElement): boolean =>
  type === "select-multiple";

export const isFileField = ({ type }: FieldElement): boolean => type === "file";

export const isFunction = (value: unknown): boolean =>
  typeof value === "function";

export const isArray = (value: unknown): boolean => Array.isArray(value);

export const isObject = (value: unknown): boolean =>
  value !== null && !isArray(value) && typeof value === "object";
