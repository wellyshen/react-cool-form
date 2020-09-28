declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormRef = RefObject<HTMLFormElement>;

  export type FormValues = Record<string, any>;

  export interface SetFieldValue<V> {
    <K extends keyof V>(name: K, value: V[K] | ((value: V[K]) => V[K])): void;
  }

  export interface Config<V> {
    defaultValues: V;
    formRef?: FormRef;
  }

  export interface Return<V> {
    formRef: FormRef;
    readonly values: V;
    readonly touched: Partial<Record<keyof V, boolean>>;
    setFieldValue: SetFieldValue<V>;
  }

  const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export default useForm;
}
