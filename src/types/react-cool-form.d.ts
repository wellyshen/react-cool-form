declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormValues = Record<string, any>;

  export type FormRef = RefObject<HTMLFormElement>;

  type Errors<V> = Partial<Record<keyof V, any>>;

  export interface Validate<V> {
    (values: V): Errors<V> | Promise<Errors<V>>;
  }

  export interface FormState<V> {
    readonly values: V;
    readonly touched: Partial<Record<keyof V, boolean>>;
    readonly errors: Partial<Record<keyof V, any>>;
    readonly isValidating: boolean;
  }

  export interface SetFieldValue<V> {
    <K extends keyof V>(
      name: K,
      value: V[K] | ((value: V[K]) => V[K]),
      shouldValidate?: boolean
    ): void;
  }

  export interface Config<V> {
    defaultValues: V;
    formRef?: FormRef;
    validate?: Validate<V>;
  }

  export interface Return<V> {
    formRef: FormRef;
    formState: FormState<V>;
    setFieldValue: SetFieldValue<V>;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
