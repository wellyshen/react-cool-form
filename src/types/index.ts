import { RefObject } from "react";

// Common
export type DefaultValues = Record<string, any>;

export type Values<T> = T | DefaultValues;

// Reducer
export interface OnValuesChange<T> {
  (values: Values<T>): void;
}

export interface FormState<T> {
  values: Values<T>;
}

export enum FormActionType {
  SET_VALUES = "SET_VALUES",
}

export type FormAction = {
  type: FormActionType.SET_VALUES;
  payload: Record<string, any>;
};

// Hook
export type FieldValues = Record<string, any>;

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Record<
  string,
  { field: FieldElement; options?: FieldElement[] }
>;

export interface Options {
  defaultValues?: DefaultValues;
}

export interface SetValue<T> {
  (name: string, value: any): void;
}

export interface Return<T> extends Readonly<FormState<T>> {
  formRef: RefObject<HTMLFormElement>;
  setValue: SetValue<T>;
}
