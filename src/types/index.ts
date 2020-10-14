import { MutableRefObject, RefObject } from "react";

// State
type Touched<V> = {
  [K in keyof V]?: V[K] extends boolean ? boolean : Touched<V[K]>;
};

type Message = string | boolean | undefined;

type Errors<V> = {
  [K in keyof V]?: V[K] extends Message ? Message : Errors<V[K]>;
};

export interface FormState<V> {
  values: V;
  touched: Touched<V>;
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

type ReturnErrors<V> = Errors<V> | boolean | void;

interface Validate<V> {
  (values: V, setFieldError: SetFieldError):
    | ReturnErrors<V>
    | Promise<ReturnErrors<V>>;
}

export interface ValidateCallback {
  (value: any): Message | Promise<Message>;
}

export interface ValidateRef {
  (callback: ValidateCallback): (field: FieldElement | null) => void;
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
  validate: ValidateRef;
  formState: Readonly<FormState<V>>;
  setFieldValue: SetFieldValue;
  setFieldError: SetFieldError;
}
