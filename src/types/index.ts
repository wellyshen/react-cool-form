import { MutableRefObject, RefObject } from "react";

// Common
export type UsedRef = Record<string, boolean>;

// State
type Prop<V, T = any> = { [K in keyof V]?: V[K] extends T ? T : Prop<V[K]> };

export type Errors<V> = Prop<V>;

export interface FormState<V> {
  values: V;
  touched: Prop<V, boolean>;
  errors: Errors<V>;
  isDirty: boolean;
  dirtyFields: Prop<V, boolean>;
  isValid: boolean;
  isValidating: boolean;
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (path: string, value?: any): void;
}

export interface ResetStateRef<V> {
  (
    values: V | undefined,
    exclude: (keyof FormState<V>)[],
    callback: (nextValues: V) => void
  ): void;
}

export interface SetUsedStateRef {
  (path: string): void;
}

export interface FormStateReturn<V> {
  stateRef: StateRef<V>;
  setStateRef: SetStateRef;
  resetStateRef: ResetStateRef<V>;
  setUsedStateRef: SetUsedStateRef;
}

// Hook
export type FormValues = Record<string, any>;

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Record<
  string,
  { field: FieldElement; options?: FieldElement[] }
>;

export interface Set {
  (object: any, path: string, value?: unknown, immutable?: boolean): any;
}

interface Validate<V> {
  (values: V, set: Set): Errors<V> | void | Promise<Errors<V> | void>;
}

export interface GetFormState {
  (path: string | string[] | Record<string, string>, watch?: boolean): any;
}

export interface SetErrors<V> {
  (
    errors?: Errors<V> | ((previousErrors: Errors<V>) => Errors<V> | undefined)
  ): void;
}

export interface SetFieldError {
  (name: string, error?: any | ((previousError?: any) => any)): void;
}

export interface SetValues<V> {
  (
    values: V | ((previousValues: V) => V),
    options?: {
      shouldValidate?: boolean;
      touchedFields?: string[];
      dirtyFields?: string[];
    }
  ): void;
}

export interface SetFieldValue {
  (
    name: string,
    value: any | ((previousValue: any) => any),
    options?: {
      shouldValidate?: boolean;
      isTouched?: boolean;
      isDirty?: boolean;
    }
  ): void;
}

export interface FieldValidateFn<V> {
  (value: any, values: V): any | Promise<any>;
}

export interface ValidateRef<V> {
  (validateFn: FieldValidateFn<V>): (field: FieldElement | null) => void;
}

export interface Controller<E, V> {
  (
    name: string,
    options?: {
      validate?: FieldValidateFn<V>;
      value?: any;
      parser?: (event: E) => any;
      onChange?: (event: E, value?: any) => void;
      onBlur?: (event: E) => void;
    }
  ):
    | {
        name: string;
        value: any;
        onChange: (event: E) => void;
        onBlur: (event: E) => void;
      }
    | Record<string, unknown>;
}

export interface Reset<V> {
  (values?: V, exclude?: (keyof FormState<V>)[]): void;
}

export interface Config<V> {
  initialValues: V;
  validate?: Validate<V>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface Return<V> {
  formRef: RefObject<HTMLFormElement>;
  getFormState: GetFormState;
  setErrors: SetErrors<V>;
  setFieldError: SetFieldError;
  setValues: SetValues<V>;
  setFieldValue: SetFieldValue;
  validate: ValidateRef<V>;
  validateField: (name: string) => void;
  validateForm: () => void;
  controller: Controller<any, V>;
  reset: Reset<V>;
}
