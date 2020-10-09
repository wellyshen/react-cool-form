import { MutableRefObject, RefObject } from "react";

// State
type Errors<V> = Partial<Record<keyof V, string>>;

export interface FormState<V> {
  values: V;
  touched: Partial<Record<keyof V, boolean>>;
  errors: Errors<V>;
  isValidating: boolean;
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (path: string, value: any): void;
}

export type UsedStateRef<V> = Partial<Record<keyof FormState<V>, boolean>>;

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
  (values: V, setFieldError: SetFieldError):
    | Errors<V>
    | void
    | Promise<Errors<V> | void>;
}

export interface SetFieldValue {
  (
    name: string,
    value: any | ((previousValue: any) => any),
    shouldValidate?: boolean
  ): void;
}

export interface SetFieldError {
  (name: string, error: string | ((previousError?: string) => string)): void;
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
  setFieldValue: SetFieldValue;
  setFieldError: SetFieldError;
}
