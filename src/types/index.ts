import { RefObject, Reducer } from "react";

// Reducer
export interface FormState<V> {
  values: V;
  touched: Partial<Record<keyof V, boolean>>;
}

export interface OnStateChange<V> {
  (state: FormState<V>): void;
}

export enum FormActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  SET_FIELD_TOUCHED = "SET_FIELD_TOUCHED",
}

export type FormAction =
  | { type: FormActionType.SET_FIELD_VALUE; payload: Record<string, any> }
  | {
      type: FormActionType.SET_FIELD_TOUCHED;
      payload: Record<string, boolean>;
    };

export type FormReducer<V> = Reducer<FormState<V>, FormAction>;

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

export interface SetFieldValue<V> {
  <K extends keyof V>(name: K, value: V[K] | ((value: V[K]) => V[K])): void;
}

export interface Config<V> {
  defaultValues: V;
  formRef?: FormRef;
}

export interface Return<V> extends Readonly<FormState<V>> {
  formRef: FormRef;
  setFieldValue: SetFieldValue<V>;
}
