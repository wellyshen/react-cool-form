import { FieldElements } from "./types";

export const isCheckbox = (element: FieldElements): boolean =>
  element.type === "checkbox";

export const isRadio = (element: FieldElements): boolean =>
  element.type === "radio";

export const isMultipleSelect = (element: FieldElements): boolean =>
  element.type === "select-multiple";

export const isFile = (element: FieldElements): boolean =>
  element.type === "file";

export const isString = (value: unknown): boolean => typeof value === "string";
