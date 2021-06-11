declare module "react-cool-form" {
  import { FocusEventHandler, RefCallback, SyntheticEvent } from "react";

  // Type utils
  type ObjMap<T = boolean> = Record<string, T>;

  type DeepProps<V, T = any> = {
    [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
  };

  // useForm
  export type FormValues = ObjMap<any>;

  export interface EventOptions<V extends FormValues = FormValues> {
    removeField: RemoveField;
    getState: GetState;
    setValue: SetValue;
    setTouched: SetTouched;
    setDirty: SetDirty;
    setError: SetError;
    clearErrors: ClearErrors;
    runValidation: RunValidation;
    focus: Focus;
    reset: Reset<V>;
    submit: Submit<V>;
  }

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

  export interface FieldNamesFn<N extends string[] = string[]> {
    (names: N): N;
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

  export interface OnStateChange<V extends FormValues = FormValues> {
    (formState: FormState<V>): void;
  }

  export type RegisterForm = RefCallback<HTMLElement>;

  export interface RegisterFieldReturn {
    (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    ): void;
  }

  export interface FieldOptions<V extends FormValues = FormValues> {
    validate?: FieldValidator<V>;
    valueAsNumber?: boolean;
    valueAsDate?: boolean;
    parse?: FieldParser;
  }

  export interface RegisterField<V extends FormValues = FormValues> {
    (validate: FieldValidator<V>): RegisterFieldReturn;
    (options: FieldOptions<V>): RegisterFieldReturn;
  }

  export interface Focus {
    (name: string, delay?: number): void;
  }

  export interface RemoveField {
    (
      name: string,
      exclude?: ("defaultValue" | "value" | "touched" | "dirty" | "error")[]
    ): void;
  }

  export interface UseOptions<V extends FormValues = FormValues> {
    defaultValues?: V;
    errorWithTouched?: boolean;
  }

  export interface Use<V extends FormValues = FormValues> {
    (path: string | string[] | ObjMap<string>, options?: UseOptions<V>): any;
  }

  export interface GetState {
    (path?: string | string[] | ObjMap<string>): any;
  }

  export type SetValueOptions = {
    [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
  };

  export interface SetValue {
    (
      name: string,
      value: any | PreviousValueFn,
      options?: SetValueOptions
    ): void;
  }

  export type SetTouchedOptions = {
    shouldValidate?: boolean;
  };

  export interface SetTouched {
    (name: string, isTouched?: boolean, options?: SetTouchedOptions): void;
  }

  export interface SetDirty {
    (name: string, isDirty?: boolean): void;
  }

  export interface SetError {
    (name: string, error: any | PreviousErrorFn): void;
  }

  export interface ClearErrors {
    (name?: string | string[]): void;
  }

  export type RunValidationOptions = {
    shouldFocus?: boolean;
  };

  export interface RunValidation {
    (
      name?: string | string[],
      options?: RunValidationOptions
    ): Promise<boolean>;
  }

  export interface Reset<V extends FormValues = FormValues> {
    (
      values?: V | PreviousValuesFn<V> | null,
      exclude?: (keyof FormState<V>)[] | null,
      event?: SyntheticEvent
    ): void;
  }

  export interface Submit<V extends FormValues = FormValues> {
    (event?: SyntheticEvent): Promise<{
      values?: V;
      errors?: FormErrors<V>;
    }>;
  }

  export type FormConfig<V extends FormValues = FormValues> = Partial<{
    id: string;
    defaultValues: V;
    validate: FormValidator<V>;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    focusOnError: boolean | string[] | FieldNamesFn;
    removeOnUnmounted: boolean | string[] | FieldNamesFn;
    builtInValidationMode: "message" | "state" | false;
    excludeFields: string[];
    onReset: ResetHandler<V>;
    onSubmit: SubmitHandler<V>;
    onError: ErrorHandler<V>;
    onStateChange: OnStateChange<V>;
  }>;

  export interface FormMethods<V extends FormValues = FormValues> {
    form: RegisterForm;
    field: RegisterField<V>;
    focus: Focus;
    removeField: RemoveField;
    use: Use<V>;
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
  export type Path = string | string[] | ObjMap<string>;

  export type FormStateConfig<V> = Partial<{
    formId: string;
    defaultValues: V;
    errorWithTouched: boolean;
  }>;

  export interface FormStateCallback {
    (props: any): void;
  }

  export function useFormState<V extends FormValues = FormValues>(
    path: Path,
    config?: FormStateConfig<V>,
    formId?: string
  ): any;

  export function useFormState(
    path: Path,
    callback?: FormStateCallback,
    formId?: string
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
  export type HelperOptions = Partial<{
    shouldTouched: boolean;
    shouldDirty: boolean;
  }>;

  export interface Push<T = any> {
    (value: T, options?: HelperOptions): void;
  }

  export interface Insert<T = any> {
    (index: number, value: T, options?: HelperOptions): void;
  }

  export interface Remove<T = any> {
    (index: number): T | void;
  }

  export interface Swap {
    (indexA: number, indexB: number): void;
  }

  export interface Move {
    (from: number, to: number): void;
  }

  export type FieldArrayConfig<
    T = any,
    V extends FormValues = FormValues
  > = Partial<{
    formId: string;
    defaultValue: T[];
    validate: FieldValidator<V>;
  }>;

  export type FieldArrayReturn<T = any> = [
    string[],
    {
      push: Push<T>;
      insert: Insert<T>;
      remove: Remove<T>;
      swap: Swap;
      move: Move;
    }
  ];

  export function useFieldArray<T = any, V extends FormValues = FormValues>(
    name: string,
    config?: FieldArrayConfig<T, V>
  ): FieldArrayReturn<T>;

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
