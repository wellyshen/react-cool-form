import { RefObject, Reducer } from "react";

// Common
type Errors<V> = Partial<Record<keyof V, any>>;

// Reducer
export interface FormState<V> {
  values: V;
  touched: Partial<Record<keyof V, boolean>>;
  errors: Errors<V>;
  isValidating: boolean;
}

export interface OnStateChange<V> {
  (state: FormState<V>): void;
}

export enum FormActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  SET_FIELD_TOUCHED = "SET_FIELD_TOUCHED",
  SET_ISVALIDATING = "SET_ISVALIDATING",
  SET_ERRORS = "SET_ERRORS",
}

export type FormAction<V> =
  | { type: FormActionType.SET_FIELD_VALUE; payload: Record<keyof V, any> }
  | {
      type: FormActionType.SET_FIELD_TOUCHED;
      payload: Record<keyof V, boolean>;
    }
  | {
      type: FormActionType.SET_ERRORS;
      payload: Errors<V>;
    }
  | { type: FormActionType.SET_ISVALIDATING; payload: boolean };

export type FormReducer<V> = Reducer<FormState<V>, FormAction<V>>;

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

interface Validate<V> {
  (values: V): Errors<V> | Promise<Errors<V>>;
}

export interface SetFieldValue<V> {
  <K extends keyof V>(
    name: K,
    value: V[K] | ((value: V[K]) => V[K]),
    shouldValidate?: boolean
  ): void;
}

export interface Config<V> {
  defaultValues: V;
  formRef?: FormRef;
  validate?: Validate<V>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface Return<V> {
  formRef: FormRef;
  formState: Readonly<FormState<V>>;
  setFieldValue: SetFieldValue<V>;
}
