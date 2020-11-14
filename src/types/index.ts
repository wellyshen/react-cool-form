import { FocusEvent, MutableRefObject, RefObject, SyntheticEvent } from "react";

// Utils
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? T extends unknown[]
    ? DeepPartial<T[number]>[]
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

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
  isValidating: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (path: string, value?: any, actualPath?: string): void;
}

export interface SetUsedStateRef {
  (path: string): void;
}

export interface FormStateReturn<V> {
  stateRef: StateRef<V>;
  setStateRef: SetStateRef;
  setUsedStateRef: SetUsedStateRef;
}

// Form
export type FormValues = Record<string, any>;

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Record<
  string,
  { field: FieldElement; options?: FieldElement[] }
>;

type Options<V> = Omit<
  Return<V>,
  "formRef" | "validate" | "submit" | "controller"
>;

interface OnReset<V> {
  (
    values: V,
    options: Omit<Options<V>, "reset">,
    event?: Event | SyntheticEvent<any>
  ): void;
}

interface OnSubmit<V> {
  (
    values: V,
    options: Options<V>,
    event?: Event | SyntheticEvent<any>
  ): void | Promise<void>;
}

interface OnError<V> {
  (
    errors: Errors<V>,
    options: Options<V>,
    event?: Event | SyntheticEvent<any>
  ): void;
}

export interface Debug<V> {
  (formState: FormState<V>): void;
}

interface FormValidator<V> {
  (values: V): Errors<V> | void | Promise<Errors<V> | void>;
}

export interface FieldValidator<V> {
  (value: any, values: V): any | Promise<any>;
}

export interface ValidateRef<V> {
  (validate: FieldValidator<V>): (field: FieldElement | null) => void;
}

export interface GetState {
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
      [k in "shouldValidate" | "isTouched" | "isDirty"]?: boolean;
    }
  ): void;
}

export interface ValidateForm<V> {
  (): Promise<Errors<V>>;
}

export interface ValidateField<V> {
  (name: string): Promise<Errors<V>>;
}

export interface Reset<V> {
  (
    values?: V | ((previousValues: V) => V) | null,
    exclude?: (keyof FormState<V>)[] | null,
    event?: SyntheticEvent<any>
  ): void;
}

export interface Submit<V> {
  (event?: SyntheticEvent<any>): Promise<{ values?: V; errors?: Errors<V> }>;
}

export interface Controller<V, E = any> {
  (
    name: string,
    options?: {
      validate?: FieldValidator<V>;
      value?: any;
      parser?: (event: E) => any;
      onChange?: (event: E, value?: any) => void;
      onBlur?: (event: FocusEvent<any>) => void;
    }
  ):
    | {
        name: string;
        value: any;
        onChange: (event: E) => void;
        onBlur: (event: FocusEvent<any>) => void;
      }
    | Record<string, unknown>;
}

export type Config<V> = Partial<{
  defaultValues: DeepPartial<V>;
  validate: FormValidator<V>;
  validateOnChange: boolean;
  validateOnBlur: boolean;
  ignoreFields: string[];
  onReset: OnReset<V>;
  onSubmit: OnSubmit<V>;
  onError: OnError<V>;
  debug: Debug<V>;
}>;

export interface Return<V> {
  formRef: RefObject<HTMLFormElement>;
  validate: ValidateRef<V>;
  getState: GetState;
  setErrors: SetErrors<V>;
  setFieldError: SetFieldError;
  setValues: SetValues<V>;
  setFieldValue: SetFieldValue;
  validateForm: ValidateForm<V>;
  validateField: ValidateField<V>;
  reset: Reset<V>;
  submit: Submit<V>;
  controller: Controller<V>;
}
