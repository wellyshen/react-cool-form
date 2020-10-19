declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  type Prop<V, T = any> =
    | {
        [K in keyof V]: V[K] extends T ? T : Prop<V[K]>;
      }
    | Record<string, never>;

  export type Touched<V = FormValues> = Prop<V, boolean>;

  export type Message = string | boolean | undefined;

  export type Errors<V = FormValues> = Prop<V, Message>;

  interface Set {
    (object: any, path: string, value?: unknown, immutable?: boolean): any;
  }

  export interface Validate<V = FormValues> {
    (values: V, set: Set): Errors<V> | void | Promise<Errors<V> | void>;
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
    readonly touched: Touched<V>;
    readonly errors: Errors<V>;
    readonly isValid: boolean;
    readonly isValidating: boolean;
  }

  export interface GetFormState<T = any> {
    (path?: string): T;
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
    getFormState: GetFormState;
    setFieldValue: SetFieldValue;
    setFieldError: SetFieldError;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
