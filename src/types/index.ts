import { MutableRefObject, RefObject } from "react";

// State
type Prop<V, T = any> = { [K in keyof V]?: V[K] extends T ? T : Prop<V[K]> };

export type Errors<V> = Prop<V>;

export interface FormState<V> {
  values: V;
  touched: Prop<V, boolean>;
  errors: Errors<V>;
  isValid: boolean;
  isValidating: boolean;
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (path: string, value?: any): void;
}

export type UsedStateRef<V> = Partial<Record<keyof FormState<V>, boolean>>;

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
  (values: V, options: { formState: FormState<V>; set: Set }):
    | Errors<V>
    | void
    | Promise<Errors<V> | void>;
}

export interface FieldValidateFn<V> {
  (value: any, formState: FormState<V>): any | Promise<any>;
}

export interface ValidateRef<V> {
  (validateFn: FieldValidateFn<V>): (field: FieldElement | null) => void;
}

export interface GetFormState<T = any> {
  (path?: string): T;
}

export interface SetFieldValue {
  (
    name: string,
    value: any | ((previousValue: any) => any),
    shouldValidate?: boolean
  ): void;
}

export interface SetFieldError {
  (name: string, error?: any | ((previousError?: any) => any)): void;
}

export interface Config<V> {
  defaultValues: V;
  validate?: Validate<V>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface Return<V> {
  formRef: RefObject<HTMLFormElement>;
  validate: ValidateRef<V>;
  formState: Readonly<FormState<V>>;
  getFormState: GetFormState;
  setFieldValue: SetFieldValue;
  setFieldError: SetFieldError;
  validateField: (name: string) => void;
  validateForm: () => void;
}
