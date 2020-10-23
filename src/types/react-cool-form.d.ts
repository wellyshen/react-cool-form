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
    readonly isValid: boolean;
    readonly isValidating: boolean;
  }

  export interface Validate<V = FormValues> {
    (values: V, options: { formState: FormState<V>; set: Set }):
      | Errors<V>
      | void
      | Promise<Errors<V> | void>;
  }

  export interface FieldValidateFn<V = FormValues> {
    (value: any, formState: FormState<V>): any | Promise<any>;
  }

  interface ValidateRef<V> {
    (validateFn: FieldValidateFn<V>): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  interface SetValues<V> {
    (
      values: V | ((previousValues: V) => V),
      options?: { shouldValidate?: boolean; touchedFields?: string[] }
    ): void;
  }

  interface SetFieldValue {
    (
      name: string,
      value: any | ((previousValue: any) => any),
      options?: { shouldValidate?: boolean; shouldTouched?: boolean }
    ): void;
  }

  interface SetErrors<V> {
    (
      errors?: Errors<V> | ((previousErrors: Errors<V>) => Errors<V> | void)
    ): void;
  }

  interface SetFieldError {
    (name: string, error?: any | ((previousError?: any) => any)): void;
  }

  export interface Config<V = FormValues> {
    defaultValues: V;
    validate?: Validate<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }

  export interface Return<V = FormValues> {
    formRef: RefObject<HTMLFormElement>;
    validate: ValidateRef<V>;
    formState: FormState<V>;
    getFormState: (path?: string) => any;
    setValues: SetValues<V>;
    setFieldValue: SetFieldValue;
    setErrors: SetErrors<V>;
    setFieldError: SetFieldError;
    validateField: (name: string) => void;
    validateForm: () => void;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
