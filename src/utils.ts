import { FieldElement } from "./types";

export const isCheckbox = (element: FieldElement): boolean =>
  element.type === "checkbox";

export const isRadio = (element: FieldElement): boolean =>
  element.type === "radio";

export const isMultipleSelect = (element: FieldElement): boolean =>
  element.type === "select-multiple";

export const isFile = (element: FieldElement): boolean =>
  element.type === "file";

export const isString = (value: unknown): boolean => typeof value === "string";
