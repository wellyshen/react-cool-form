declare module "react-cool-form" {
  import { FocusEvent, RefObject, SyntheticEvent } from "react";

  type DeepProps<V, T = any> = {
    [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
  };

  interface Options<V> {
    formState: FormState<V>;
    setErrors: SetErrors<V>;
    setFieldError: SetFieldError;
    setValues: SetValues<V>;
    setFieldValue: SetFieldValue;
    validateForm: ValidateForm<V>;
    validateField: ValidateField;
    reset: Reset<V>;
    submit: Submit<V>;
  }

  interface GetState {
    (
      path: string | string[] | Record<string, string>,
      options?: {
        target?: string;
        watch?: boolean;
        filterUntouchedError?: boolean;
      }
    ): any;
  }

  interface SetValues<V> {
    (
      values: V | PreviousValuesFn<V>,
      options?: {
        shouldValidate?: boolean;
        touched?: string[] | FieldNamesFn;
        dirty?: string[] | FieldNamesFn;
      }
    ): void;
  }

  interface SetFieldValue {
    (
      name: string,
      value?: any | PreviousValueFn,
      options?: {
        [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
      }
    ): void;
  }

  interface SetErrors<V> {
    (errors?: FormErrors<V> | PreviousErrorsFn<FormErrors<V>>): void;
  }

  interface SetFieldError {
    (name: string, error?: any | PreviousErrorFn): void;
  }

  interface FieldRef<V> {
    (
      validateOrOptions:
        | FieldValidator<V>
        | {
            validate?: FieldValidator<V>;
            valueAsNumber?: boolean;
            valueAsDate?: boolean;
            parse?: Parser;
          }
    ): (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ) => void;
  }

  interface ValidateForm<V> {
    (): Promise<FormErrors<V>>;
  }

  interface ValidateField {
    (name: string): Promise<any>;
  }

  interface Reset<V> {
    (
      values?: V | PreviousValuesFn<V> | null,
      exclude?: (keyof FormState<V>)[] | null,
      event?: SyntheticEvent
    ): void;
  }

  interface Submit<V> {
    (event?: SyntheticEvent): Promise<{
      values?: V;
      errors?: FormErrors<V>;
    }>;
  }

  export type FormValues = Record<string, any>;

  export type FormErrors<E = FormValues> = DeepProps<E>;

  export type FormState<V = FormValues> = Readonly<{
    values: V;
    touched: DeepProps<V, boolean>;
    errors: FormErrors<V>;
    isDirty: boolean;
    dirty: DeepProps<V, boolean>;
    isValidating: boolean;
    isValid: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitCount: number;
  }>;

  export interface Parser<A = any[], R = any> {
    (...args: A): R;
  }

  export interface Formatter<V = any, R = any> {
    (value: V): R;
  }

  export interface FieldNamesFn {
    (fieldNames: string[]): string[];
  }

  export interface PreviousValuesFn<V = any> {
    (previousValues: V): V;
  }

  export interface PreviousValueFn {
    (previousValue: any): any;
  }

  export interface PreviousErrorsFn<E = FormErrors> {
    (previousErrors: E): E | undefined;
  }

  export interface PreviousErrorFn {
    (previousError?: any): any;
  }

  export interface FormValidator<V = FormValues> {
    (values: V): FormErrors<V> | void | Promise<FormErrors<V> | void>;
  }

  export interface FieldValidator<V = FormValues> {
    (value: any, values: V): any | Promise<any>;
  }

  export interface ChangeHandler<E = any> {
    (event: E, value: any): void;
  }

  export interface BlurHandler {
    (event: FocusEvent): void;
  }

  export interface ResetHandler<V = FormValues> {
    (values: V, options: Options<V>, event?: Event | SyntheticEvent): void;
  }

  export interface SubmitHandler<V = FormValues> {
    (
      values: V,
      options: Options<V>,
      event?: Event | SyntheticEvent
    ): void | Promise<void>;
  }

  export interface ErrorHandler<V = FormValues> {
    (
      errors: FormErrors<V>,
      options: Options<V>,
      event?: Event | SyntheticEvent
    ): void;
  }

  export interface Controller<V = FormValues, E = any> {
    (
      name: string,
      options?: {
        validate?: FieldValidator<V>;
        value?: any;
        defaultValue?: any;
        parse?: Parser;
        format?: Formatter;
        onChange?: ChangeHandler<E>;
        onBlur?: BlurHandler;
      }
    ): {
      name: string;
      value: any;
      onChange: (event: E) => void;
      onBlur: BlurHandler;
    } | void;
  }

  export interface Debug<V> {
    (formState: FormState<V>): void;
  }

  export type Config<V = FormValues> = Partial<{
    defaultValues: V;
    validate: FormValidator<V>;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    builtInValidationMode: "message" | "state" | false;
    shouldRemoveField: boolean;
    ignoreFields: string[];
    onReset: ResetHandler<V>;
    onSubmit: SubmitHandler<V>;
    onError: ErrorHandler<V>;
    debug: Debug<V>;
  }>;

  export interface Return<V = FormValues> {
    form: RefObject<HTMLFormElement>;
    field: FieldRef<V>;
    getState: GetState;
    setErrors: SetErrors<V>;
    setFieldError: SetFieldError;
    setValues: SetValues<V>;
    setFieldValue: SetFieldValue;
    validateForm: ValidateForm<V>;
    validateField: ValidateField;
    reset: Reset<V>;
    submit: Submit<V>;
    controller: Controller<V>;
  }

  export function useForm<V extends FormValues = FormValues>(
    config?: Config<V>
  ): Return<V>;

  export function get(object: any, path: string, defaultValue?: unknown): any;

  export function set(
    object: any,
    path: string,
    value: unknown,
    immutable?: boolean
  ): any;

  export function unset(object: any, path: string, immutable?: boolean): any;
}
