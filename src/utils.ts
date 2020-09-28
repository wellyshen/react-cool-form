/* eslint-disable @typescript-eslint/ban-types */

import { FieldElement } from "./types";

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
