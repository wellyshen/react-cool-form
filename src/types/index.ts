import { RefObject, Reducer } from "react";

// Reducer
export interface FormState<T> {
  values: T;
  touched: Partial<Record<keyof T, boolean>>;
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
export type FormRef = RefObject<HTMLFormElement>;

export type FormValues = Record<string, any>;

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Record<
  string,
  { field: FieldElement; options?: FieldElement[] }
>;

export interface SetFieldValue<T> {
  <K extends keyof T>(name: K, value: T[K] | ((value: T[K]) => T[K])): void;
}

export interface Config<T> {
  defaultValues: T;
  formRef?: FormRef;
}

export interface Return<T> extends Readonly<FormState<T>> {
  formRef: FormRef;
  setFieldValue: SetFieldValue<T>;
}
