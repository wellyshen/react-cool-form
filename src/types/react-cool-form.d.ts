declare module "react-cool-form" {
  import { RefObject } from "react";

  export type FormRef = RefObject<HTMLFormElement>;

  export type FormValues = Record<string, any>;

  export interface SetFieldValue<T> {
    <K extends keyof T>(name: K, value: T[K] | ((value: T[K]) => T[K])): void;
  }

  export interface Config<T> {
    defaultValues: T;
    formRef?: FormRef;
  }

  export interface Return<T> {
    formRef: FormRef;
    readonly values: T;
    readonly touched: Partial<Record<keyof T, boolean>>;
    setFieldValue: SetFieldValue<T>;
  }

  const useForm: <T extends FormValues = FormValues>(
    config: Config<T>
  ) => Return<T>;

  export default useForm;
}
