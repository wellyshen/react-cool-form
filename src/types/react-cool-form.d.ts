declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  export type Touched<V = FormValues> = {
    [K in keyof V]: V[K] extends boolean ? boolean : Touched<V[K]>;
  };

  export type Message = string | boolean | undefined;

  export type Errors<V = FormValues> = {
    [K in keyof V]: V[K] extends Message ? Message : Errors<V[K]>;
  };

  export interface Validate<V = FormValues> {
    (values: V): Errors<V> | void | Promise<Errors<V> | void>;
  }

  export interface FieldValidateFn<V> {
    (value: any, values: V): Message | Promise<Message>;
  }

  export interface ValidateRef<V = FormValues> {
    (validateFn: FieldValidateFn<V>): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  export interface FormState<V = FormValues> {
    readonly values: V;
    readonly touched: Partial<Touched<V>>;
    readonly errors: Partial<Errors<V>>;
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
  }

  export interface Return<V = FormValues> {
    formRef: RefObject<HTMLFormElement>;
    validate: ValidateRef<V>;
    formState: FormState<V>;
    setFieldValue: SetFieldValue;
    setFieldError: SetFieldError;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
