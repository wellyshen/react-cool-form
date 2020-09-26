import { FieldElement } from "./types";

export const isFieldElement = (element: Element): boolean =>
  /INPUT|TEXTAREA|SELECT/.test(element.tagName) &&
  !/hidden|image|submit|reset/.test((element as FieldElement).type);

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

export const isString = (value: unknown): boolean => typeof value === "string";

export const isArray = (value: unknown): boolean => Array.isArray(value);
