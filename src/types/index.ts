import { RefObject, Reducer } from "react";

// Common
export type Values<T> = Partial<T>;

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

export type FormAction<T> = {
  type: FormActionType.SET_VALUES;
  payload: Values<T>;
};

export type FormReducer<T> = Reducer<FormState<T>, FormAction<T>>;

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

export interface Options<T> {
  defaultValues?: Values<T>;
}

export interface SetValue<T> {
  <K extends keyof T>(name: K, value: T[K]): void;
}

export interface Return<T> extends Readonly<FormState<T>> {
  formRef: RefObject<HTMLFormElement>;
  setValue: SetValue<T>;
}
