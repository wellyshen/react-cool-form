declare module "react-cool-form" {
  import { FocusEvent, SyntheticEvent } from "react";

  // Type utils
  type Map<T = boolean> = Record<string, T>;

  // useForm
  type DeepProps<V, T = any> = {
    [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
  };

  interface Options<V> {
    getState: GetState;
    setValue: SetValue;
    setTouched: SetTouched;
    setDirty: SetDirty;
    setError: SetError;
    clearErrors: ClearErrors;
    runValidation: RunValidation;
    reset: Reset<V>;
    submit: Submit<V>;
  }

  interface Select {
    (
      path: string | string[] | Map<string>,
      options?: { target?: string; errorWithTouched?: boolean }
    ): any;
  }

  interface GetState {
    (path?: string | string[] | Map<string>, target?: string): any;
  }

  interface SetValue {
    (
      name: string,
      value: any | PreviousValueFn,
      options?: {
        [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
      }
    ): void;
  }

  interface SetTouched {
    (name: string, isTouched?: boolean, shouldValidate?: boolean): void;
  }

  interface SetDirty {
    (name: string, isDirty?: boolean): void;
  }

  interface SetError {
    (name: string, error: any | PreviousErrorFn): void;
  }

  interface ClearErrors {
    (name?: string | string[]): void;
  }

  interface RegisterForm {
    (element: HTMLElement | null): void;
  }

  interface RegisterField<V> {
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

  interface RunValidation {
    (name?: string | string[]): Promise<boolean>;
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

  export type FormValues = Map<any>;

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

  export interface PreviousValuesFn<V = FormValues> {
    (previousValues: V): V;
  }

  export interface PreviousValueFn {
    (previousValue: any): any;
  }

  export interface PreviousErrorFn {
    (previousError?: any): any;
  }

  export interface FormValidator<V = FormValues> {
    (values: V):
      | FormErrors<V>
      | false
      | void
      | Promise<FormErrors<V> | false | void>;
  }

  export interface FieldValidator<V = FormValues> {
    (value: any, values: V): any | Promise<any>;
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

  export interface Debug<V = FormValues> {
    (formState: FormState<V>): void;
  }

  export type FormConfig<V = FormValues> = Partial<{
    id: string;
    defaultValues: V;
    validate: FormValidator<V>;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    builtInValidationMode: "message" | "state" | false;
    shouldRemoveField: boolean;
    excludeFields: string[];
    onReset: ResetHandler<V>;
    onSubmit: SubmitHandler<V>;
    onError: ErrorHandler<V>;
    debug: Debug<V>;
  }>;

  export interface FormReturn<V = FormValues> {
    form: RegisterForm;
    field: RegisterField<V>;
    select: Select;
    getState: GetState;
    setValue: SetValue;
    setTouched: SetTouched;
    setDirty: SetDirty;
    setError: SetError;
    clearErrors: ClearErrors;
    runValidation: RunValidation;
    reset: Reset<V>;
    submit: Submit<V>;
  }

  export function useForm<V extends FormValues = FormValues>(
    config?: FormConfig<V>
  ): FormReturn<V>;

  // useFormState
  export type Path = string | string[] | Map<string>;

  export interface StateConfig {
    formId: string;
    target?: string;
    errorWithTouched?: boolean;
  }

  export function useFormState(path: Path, config: StateConfig): any;

  // useControlled
  export interface Parser<A extends any[] = any[], R = any> {
    (...args: A): R;
  }

  export interface Formatter<V = any, R = any> {
    (value: V): R;
  }

  export interface BlurHandler {
    (event: FocusEvent): void;
  }

  export interface ControlledConfig<V = FormValues> {
    formId: string;
    validate?: FieldValidator<V>;
    defaultValue?: any;
    parse?: Parser;
    format?: Formatter;
    errorWithTouched?: boolean;
    exclude?: boolean;
    [k: string]: any;
  }

  export interface ControlledReturn<E extends any[] = any[]> {
    fieldProps?: {
      name: string;
      value: any;
      onChange: (...args: E) => void;
      onBlur: BlurHandler;
      [k: string]: any;
    };
    meta: {
      value: any;
      error: any;
      isTouched: boolean;
      isDirty: boolean;
    };
    getState: GetState;
    setValue: SetValue;
    setTouched: SetTouched;
    setDirty: SetDirty;
    setError: SetError;
    clearErrors: ClearErrors;
    runValidation: RunValidation;
  }

  export function useControlled<V = FormValues, E extends any[] = any[]>(
    name: string,
    config: ControlledConfig<V>
  ): ControlledReturn<E>;

  // Utility functions
  export function get(object: any, path: string, defaultValue?: unknown): any;

  export function set(
    object: any,
    path: string,
    value: unknown,
    immutable?: boolean
  ): any;

  export function unset(object: any, path: string, immutable?: boolean): any;
}
