declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  type Prop<V, T = any> = { [K in keyof V]?: V[K] extends T ? T : Prop<V[K]> };

  type Errors<V> = Prop<V>;

  interface Set {
    (object: any, path: string, value?: unknown, immutable?: boolean): any;
  }

  export interface FormState<V = FormValues> {
    readonly values: V;
    readonly touched: Prop<V, boolean>;
    readonly errors: Errors<V>;
    readonly isDirty: boolean;
    readonly dirtyFields: Prop<V, boolean>;
    readonly isValid: boolean;
    readonly isValidating: boolean;
  }

  export interface Validate<V = FormValues> {
    (values: V, options: { formState: FormState<V>; set: Set }):
      | Errors<V>
      | void
      | Promise<Errors<V> | void>;
  }

  export interface EventParser<E = any, R = any> {
    (event: E): R;
  }

  export interface OnChange<E = any> {
    (event: E, value?: any): void;
  }

  export interface OnBlur<E = any> {
    (event: E): void;
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

  export interface FieldValidateFn<V = FormValues> {
    (value: any, formState: FormState<V>): any | Promise<any>;
  }

  interface ValidateRef<V> {
    (validateFn: FieldValidateFn<V>): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  export interface Controller<E = any, V = FormValues> {
    (
      name: string,
      options?: {
        validate?: FieldValidateFn<V>;
        value?: any;
        eventParser?: EventParser<E>;
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
    validate?: Validate<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }

  export interface Return<V = FormValues> {
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
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
