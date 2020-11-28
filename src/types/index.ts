import { FocusEvent, MutableRefObject, RefObject, SyntheticEvent } from "react";

// Common
export type Map = Record<string, boolean>;

// State
type DeepProps<V, T = any> = {
  [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
};

export type Errors<V> = DeepProps<V>;

export interface FormState<V> {
  values: V;
  touched: DeepProps<V, boolean>;
  errors: Errors<V>;
  isDirty: boolean;
  dirtyFields: DeepProps<V, boolean>;
  isValidating: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (
    path: string,
    value?: any,
    options?: { fieldPath?: string; shouldUpdate?: boolean }
  ): void;
}

export interface SetUsedStateRef {
  (path: string): void;
}

export interface SetDefaultValuesRef<V> {
  (values: V): void;
}

export interface FormStateReturn<V> {
  stateRef: StateRef<V>;
  setStateRef: SetStateRef;
  setUsedStateRef: SetUsedStateRef;
  setDefaultValuesRef: SetDefaultValuesRef<V>;
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
  (
    path: string | string[] | Record<string, string>,
    options?: {
      target?: string;
      watch?: boolean;
      filterUntouchedErrors?: boolean;
    }
  ): any;
}

export interface SetErrors<V> {
  (
    errors?: Errors<V> | ((previousErrors: Errors<V>) => Errors<V> | undefined)
  ): void;
}

export interface SetFieldError {
  (name: string, error?: any | ((previousError?: any) => any)): void;
}

type ValuesArg<V> = V | ((previousValues: V) => V);

export interface SetValues<V> {
  (
    values: ValuesArg<V>,
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
      [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
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
    values?: ValuesArg<V> | null,
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
      defaultValue?: any;
      parse?: (event: E) => any;
      format?: (value: any) => any;
      onChange?: (event: E, value?: any) => void;
      onBlur?: (event: FocusEvent<any>) => void;
    }
  ): {
    name: string;
    value: any;
    onChange: (event: E) => void;
    onBlur: (event: FocusEvent<any>) => void;
  } | void;
}

export interface Config<V> {
  defaultValues: V;
  validate?: FormValidator<V>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  ignoreFields?: string[];
  onReset?: OnReset<V>;
  onSubmit?: OnSubmit<V>;
  onError?: OnError<V>;
  debug?: Debug<V>;
}

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
