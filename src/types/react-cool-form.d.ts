declare module "react-cool-form" {
  import { FocusEventHandler, SyntheticEvent } from "react";

  // Type utils
  type Map<T = boolean> = Record<string, T>;

  // useForm
  type DeepProps<V, T = any> = {
    [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
  };

  interface EventOptions<V> {
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

  interface Select<V> {
    (
      path: string | string[] | Map<string>,
      options?: {
        target?: string;
        defaultValues?: V;
        errorWithTouched?: boolean;
      }
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
            parse?: FieldParser;
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

  export type FormErrors<E extends FormValues = FormValues> = DeepProps<E>;

  export type FormState<V extends FormValues = FormValues> = Readonly<{
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

  export interface PreviousValuesFn<V extends FormValues = FormValues> {
    (previousValues: V): V;
  }

  export interface PreviousValueFn {
    (previousValue: any): any;
  }

  export interface PreviousErrorFn {
    (previousError?: any): any;
  }

  export interface FormValidator<V extends FormValues = FormValues> {
    (values: V):
      | FormErrors<V>
      | false
      | void
      | Promise<FormErrors<V> | false | void>;
  }

  export interface FieldValidator<V extends FormValues = FormValues> {
    (value: any, values: V): any | Promise<any>;
  }

  export interface FieldParser<V = any, R = any> {
    (value: V): R;
  }

  export interface ResetHandler<V extends FormValues = FormValues> {
    (values: V, options: EventOptions<V>, event?: Event | SyntheticEvent): void;
  }

  export interface SubmitHandler<V extends FormValues = FormValues> {
    (
      values: V,
      options: EventOptions<V>,
      event?: Event | SyntheticEvent
    ): void | Promise<void>;
  }

  export interface ErrorHandler<V extends FormValues = FormValues> {
    (
      errors: FormErrors<V>,
      options: EventOptions<V>,
      event?: Event | SyntheticEvent
    ): void;
  }

  export interface Debug<V extends FormValues = FormValues> {
    (formState: FormState<V>): void;
  }

  export type FormConfig<V extends FormValues = FormValues> = Partial<{
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

  export interface FormMethods<V extends FormValues = FormValues> {
    form: RegisterForm;
    field: RegisterField<V>;
    select: Select<V>;
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
  ): FormMethods<V>;

  // useFormMethods
  export function useFormMethods<V extends FormValues = FormValues>(
    formId?: string
  ): FormMethods<V>;

  // useFormState
  export type Path = string | string[] | Map<string>;

  export type FormStateConfig<V> = Partial<{
    formId: string;
    target: string;
    defaultValues: V;
    errorWithTouched: boolean;
  }>;

  export function useFormState<V extends FormValues = FormValues>(
    path: Path,
    config?: FormStateConfig<V>
  ): any;

  // useControlled
  export interface ControlledParser<E extends any[] = any[], R = any> {
    (...event: E): R;
  }

  export interface ControlledFormatter<V = any, R = any> {
    (value: V): R;
  }

  export type ControlledConfig<V extends FormValues = FormValues> = Partial<{
    formId: string;
    defaultValue: any;
    validate: FieldValidator<V>;
    parse: ControlledParser;
    format: ControlledFormatter;
    errorWithTouched: boolean;
    [k: string]: any;
  }>;

  export type ControlledReturn = [
    {
      name: string;
      value: any;
      onChange: (...event: any[]) => void;
      onBlur: FocusEventHandler;
      [k: string]: any;
    },
    { error: any; isTouched: boolean; isDirty: boolean }
  ];

  export function useControlled<V extends FormValues = FormValues>(
    name: string,
    config?: ControlledConfig<V>
  ): ControlledReturn;

  // useFieldArray
  type HelperOptions = Partial<{
    shouldTouched: boolean;
    shouldDirty: boolean;
  }>;

  interface Push<V> {
    (value: V, options?: HelperOptions): void;
  }

  interface Insert<V> {
    (index: number, value: V, options?: HelperOptions): void;
  }

  type Replace<V> = Insert<V>;

  interface Remove<V> {
    (index: number): Partial<V> | void;
  }

  interface Swap {
    (indexA: number, indexB: number): void;
  }

  interface Move {
    (from: number, to: number): void;
  }

  export type FieldArrayConfig = Partial<{
    formId: string;
    validateOnChange: boolean;
  }>;

  export type FieldArrayReturn<V = any> = [
    V[],
    {
      push: Push<V>;
      insert: Insert<V>;
      replace: Replace<V>;
      remove: Remove<V>;
      swap: Swap;
      move: Move;
    }
  ];

  export function useFieldArray<V = any>(
    name: string,
    config?: FieldArrayConfig
  ): FieldArrayReturn<V>;

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
