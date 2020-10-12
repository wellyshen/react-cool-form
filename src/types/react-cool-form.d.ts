declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  export type Touched<V = FormValues> = {
    [K in keyof V]?: V[K] extends boolean ? boolean : Touched<V[K]>;
  };

  export type Errors<V = FormValues> = {
    [K in keyof V]?: V[K] extends string ? string : Errors<V[K]>;
  };

  type PossibleError<V> = Partial<Errors<V>> | boolean | void;

  export interface Validate<V = FormValues> {
    (
      values: V,
      options: { touched: Touched<V>; setFieldError: SetFieldError }
    ): PossibleError<V> | Promise<PossibleError<V>>;
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

  type Message = string | boolean;

  export interface SetFieldError {
    (
      name: string,
      message?: Message | ((previousMessage?: Message) => Message)
    ): void;
  }

  export interface Config<V = FormValues> {
    defaultValues: V;
    validate?: Validate<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorAfterTouched?: boolean;
  }

  export interface Return<V = FormValues> {
    formRef: RefObject<HTMLFormElement>;
    formState: FormState<V>;
    setFieldValue: SetFieldValue;
    setFieldError: SetFieldError;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
