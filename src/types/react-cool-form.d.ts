declare module "react-cool-form" {
  import { FocusEvent, RefObject, SyntheticEvent } from "react";

  export type FormValues = Record<string, any>;

  type Prop<V, T = any> = { [K in keyof V]?: V[K] extends T ? T : Prop<V[K]> };

  type Errors<V> = Prop<V>;

  export interface FormState<V = FormValues> {
    readonly values: V;
    readonly touched: Prop<V, boolean>;
    readonly errors: Errors<V>;
    readonly isDirty: boolean;
    readonly dirtyFields: Prop<V, boolean>;
    readonly isValidating: boolean;
    readonly isValid: boolean;
    readonly isSubmitting: boolean;
    readonly isSubmitted: boolean;
    readonly submitCount: number;
  }

  type Options<V> = Omit<
    Return<V>,
    "formRef" | "validate" | "submit" | "controller"
  >;

  export interface OnReset<V = FormValues> {
    (
      values: V,
      options: Omit<Options<V>, "reset">,
      event?: Event | SyntheticEvent<any>
    ): void;
  }

  export interface OnSubmit<V = FormValues> {
    (
      values: V,
      options: Options<V>,
      event?: Event | SyntheticEvent<any>
    ): void | Promise<void>;
  }

  export interface OnError<V = FormValues> {
    (
      errors: Errors<V>,
      options: Options<V>,
      event?: Event | SyntheticEvent<any>
    ): void;
  }

  export interface Debug<V> {
    (formState: FormState<V>): void;
  }

  interface Set {
    (object: any, path: string, value?: unknown, immutable?: boolean): any;
  }

  export interface FormValidator<V = FormValues> {
    (values: V, set: Set): Errors<V> | void | Promise<Errors<V> | void>;
  }

  export interface FieldValidator<V = FormValues> {
    (value: any, values: V): any | Promise<any>;
  }

  interface ValidateRef<V> {
    (validate: FieldValidator<V>): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  interface GetState {
    (path: string | string[] | Record<string, string>, watch?: boolean): any;
  }

  interface SetErrors<V> {
    (
      errors?:
        | Errors<V>
        | ((previousErrors: Errors<V>) => Errors<V> | undefined)
    ): void;
  }

  interface SetFieldError {
    (name: string, error?: any | ((previousError?: any) => any)): void;
  }

  interface SetValues<V> {
    (
      values: V | ((previousValues: V) => V),
      options?: {
        shouldValidate?: boolean;
        touchedFields?: string[];
        dirtyFields?: string[];
      }
    ): void;
  }

  interface SetFieldValue {
    (
      name: string,
      value: any | ((previousValue: any) => any),
      options?: {
        [k in "shouldValidate" | "isTouched" | "isDirty"]?: boolean;
      }
    ): void;
  }

  interface ValidateForm<V> {
    (): Promise<Errors<V>>;
  }

  interface ValidateField<V> {
    (name: string): Promise<Errors<V>>;
  }

  interface Reset<V> {
    (
      values?: V | ((previousValues: V) => V) | null,
      exclude?: (keyof FormState<V>)[] | null,
      event?: SyntheticEvent<any>
    ): void;
  }

  interface Submit<V> {
    (event?: SyntheticEvent<any>): Promise<{ values?: V; errors?: Errors<V> }>;
  }

  export interface Parser<E = any, R = any> {
    (event: E): R;
  }

  export interface OnChange<E = any> {
    (event: E, value?: any): void;
  }

  export interface OnBlur {
    (event: FocusEvent<any>): void;
  }

  export interface Controller<V = FormValues, E = any> {
    (
      name: string,
      options?: {
        validate?: FieldValidator<V>;
        value?: any;
        parser?: Parser<E>;
        onChange?: OnChange<E>;
        onBlur?: OnBlur;
      }
    ):
      | {
          name: string;
          value: any;
          onChange: (event: E) => void;
          onBlur: OnBlur;
        }
      | Record<string, unknown>;
  }

  export interface Config<V = FormValues> {
    initialValues: V;
    validate?: FormValidator<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    ignoreFields?: string[];
    onReset?: OnReset<V>;
    onSubmit?: OnSubmit<V>;
    onError?: OnError<V>;
    debug?: Debug<V>;
  }

  export interface Return<V = FormValues> {
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

  export const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;
}
