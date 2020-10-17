import { MutableRefObject, RefObject } from "react";

// State
type Prop<V, T = any> =
  | {
      [K in keyof V]: V[K] extends T ? T : Prop<V[K]>;
    }
  | Record<string, never>;

type Message = string | boolean | undefined;

export type Errors<V> = Prop<V, Message>;

export interface FormState<V> {
  values: V;
  touched: Prop<V, boolean>;
  errors: Errors<V>;
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

interface Validate<V> {
  (values: V): Errors<V> | void | Promise<Errors<V> | void>;
}

export interface FieldValidateFn<V> {
  (value: any, values: V): Message | Promise<Message>;
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
  (
    name: string,
    message?: Message | ((previousMessage?: Message) => Message)
  ): void;
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
}
