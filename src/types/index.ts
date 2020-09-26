import { RefObject, Reducer } from "react";

// Common
export type Values<T> = Partial<T>;

export type Touched = Record<string, boolean>;

// Reducer
export interface FormState<T> {
  values: Values<T>;
  touched: Touched;
}

export interface OnStateChange<T> {
  (state: FormState<T>): void;
}

export enum FormActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  SET_FIELD_TOUCHED = "SET_FIELD_TOUCHED",
}

export type FormAction =
  | { type: FormActionType.SET_FIELD_VALUE; name: string; value: any }
  | { type: FormActionType.SET_FIELD_TOUCHED; name: string; value: boolean };

export type FormReducer<T> = Reducer<FormState<T>, FormAction>;

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
  setFieldValue: SetValue<T>;
}
