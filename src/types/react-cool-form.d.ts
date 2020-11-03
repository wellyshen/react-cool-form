declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  type Prop<V, T = any> = { [K in keyof V]?: V[K] extends T ? T : Prop<V[K]> };

  type Errors<V> = Prop<V>;

  export interface FormState<V = FormValues> {
    readonly values: V;
    readonly touched: Prop<V, boolean>;
    readonly errors: Errors<V>;
    readonly isDirty: boolean;
    readonly dirtyFields: Prop<V, boolean>;
    readonly isValid: boolean;
    readonly isValidating: boolean;
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

  interface GetFormState {
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
        shouldValidate?: boolean;
        isTouched?: boolean;
        isDirty?: boolean;
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
    (values?: V, exclude?: (keyof FormState<V>)[]): void;
  }

  export interface Parser<E = any, R = any> {
    (event: E): R;
  }

  export interface OnChange<E = any> {
    (event: E, value?: any): void;
  }

  export interface OnBlur<E = any> {
    (event: E): void;
  }

  export interface Controller<E = any, V = FormValues> {
    (
      name: string,
      options?: {
        validate?: FieldValidator<V>;
        value?: any;
        parser?: Parser<E>;
        onChange?: OnChange<E>;
        onBlur?: OnBlur<E>;
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

  export interface Config<V = FormValues> {
    initialValues: V;
    validate?: FormValidator<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }

  export interface Return<V = FormValues> {
    formRef: RefObject<HTMLFormElement>;
    validate: ValidateRef<V>;
    getFormState: GetFormState;
    setErrors: SetErrors<V>;
    setFieldError: SetFieldError;
    setValues: SetValues<V>;
    setFieldValue: SetFieldValue;
    validateForm: ValidateForm<V>;
    validateField: ValidateField<V>;
    reset: Reset<V>;
    controller: Controller<any, V>;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
