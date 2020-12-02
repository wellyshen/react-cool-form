declare module "react-cool-form" {
  import { FocusEvent, RefObject, SyntheticEvent } from "react";

  export type FormValues = Record<string, any>;

  type DeepProps<V, T = any> = {
    [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
  };

  type Errors<V> = DeepProps<V>;

  export type FormState<V = FormValues> = Readonly<{
    values: V;
    touched: DeepProps<V, boolean>;
    errors: Errors<V>;
    isDirty: boolean;
    dirtyFields: DeepProps<V, boolean>;
    isValidating: boolean;
    isValid: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitCount: number;
  }>;

  type Options<V> = Omit<
    Return<V>,
    "formRef" | "validate" | "submit" | "field"
  >;

  export interface OnReset<V = FormValues> {
    (
      values: V,
      options: Omit<Options<V>, "reset">,
      event?: Event | SyntheticEvent<any>
    ): void;
  }

  export interface OnSubmit<V = FormValues> {
    (
      values: V,
      options: Options<V>,
      event?: Event | SyntheticEvent<any>
    ): void | Promise<void>;
  }

  export interface OnError<V = FormValues> {
    (
      errors: Errors<V>,
      options: Options<V>,
      event?: Event | SyntheticEvent<any>
    ): void;
  }

  export interface Debug<V> {
    (formState: FormState<V>): void;
  }

  export interface FormValidator<V = FormValues> {
    (values: V): Errors<V> | void | Promise<Errors<V> | void>;
  }

  export interface FieldValidator<V = FormValues> {
    (value: any, values: V): any | Promise<any>;
  }

  interface ValidateRef<V> {
    (validate: FieldValidator<V>): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  interface GetState {
    (
      path: string | string[] | Record<string, string>,
      options?: {
        target?: string;
        watch?: boolean;
        filterUntouchedErrors?: boolean;
      }
    ): any;
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

  type ValuesArg<V> = V | ((previousValues: V) => V);

  interface SetValues<V> {
    (
      values: ValuesArg<V>,
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
        [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
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
    (
      values?: ValuesArg<V> | null,
      exclude?: (keyof FormState<V>)[] | null,
      event?: SyntheticEvent<any>
    ): void;
  }

  interface Submit<V> {
    (event?: SyntheticEvent<any>): Promise<{ values?: V; errors?: Errors<V> }>;
  }

  export interface Parse<E = any, R = any> {
    (event: E): R;
  }

  export interface Format<V = any, R = any> {
    (value: V): R;
  }

  export interface OnChange<E = any> {
    (event: E, value?: any): void;
  }

  export interface OnBlur {
    (event: FocusEvent<any>): void;
  }

  export interface Field<V = FormValues, E = any> {
    (
      name: string,
      options?: {
        validate?: FieldValidator<V>;
        value?: any;
        defaultValue?: any;
        parse?: Parse<E>;
        format?: Format;
        onChange?: OnChange<E>;
        onBlur?: OnBlur;
        controlled?: boolean;
      }
    ): {
      name: string;
      value: any;
      onChange: (event: E) => void;
      onBlur: OnBlur;
    } | void;
  }

  export interface Config<V = FormValues> {
    defaultValues: V;
    validate?: FormValidator<V>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    ignoreFields?: string[];
    onReset?: OnReset<V>;
    onSubmit?: OnSubmit<V>;
    onError?: OnError<V>;
    debug?: Debug<V>;
  }

  export interface Return<V = FormValues> {
    formRef: RefObject<HTMLFormElement>;
    validate: ValidateRef<V>;
    getState: GetState;
    setErrors: SetErrors<V>;
    setFieldError: SetFieldError;
    setValues: SetValues<V>;
    setFieldValue: SetFieldValue;
    validateForm: ValidateForm<V>;
    validateField: ValidateField<V>;
    reset: Reset<V>;
    submit: Submit<V>;
    field: Field<V>;
  }

  export const useForm: <V extends FormValues = FormValues>(
    config: Config<V>
  ) => Return<V>;

  export const get: (object: any, path: string, defaultValue?: unknown) => any;

  export const set: (
    object: any,
    path: string,
    value: unknown,
    immutable?: boolean
  ) => any;

  export const unset: (object: any, path: string, immutable?: boolean) => any;
}
