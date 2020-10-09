declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormRef = RefObject<HTMLFormElement>;

  export type FormValues = Record<string, any>;

  export type Errors<V = FormValues> = Partial<Record<keyof V, string>>;

  export interface Validate<V = FormValues> {
    (values: V, setFieldError: SetFieldError):
      | Errors<V>
      | void
      | Promise<Errors<V> | void>;
  }

  export interface FormState<V = FormValues> {
    readonly values: V;
    readonly touched: Partial<Record<keyof V, boolean>>;
    readonly errors: Errors<V>;
    readonly isValidating: boolean;
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

  export interface Config<V = FormValues> {
    defaultValues: V;
    formRef?: FormRef;
    validate?: Validate<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorAfterTouched?: boolean;
  }

  export interface Return<V = FormValues> {
    formRef: FormRef;
    formState: FormState<V>;
    setFieldValue: SetFieldValue;
    setFieldError: SetFieldError;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
