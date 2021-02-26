import { FocusEvent, MutableRefObject, SyntheticEvent } from "react";

// Utils
export type Map<T = boolean> = Record<string, T>;

// Global
export interface Methods {
  shouldRemoveField: boolean;
  defaultValuesRef: MutableRefObject<any>;
  initialStateRef: MutableRefObject<FormState<any>>;
  excludeFieldsRef: MutableRefObject<Map>;
  controllersRef: MutableRefObject<Map>;
  fieldValidatorsRef: MutableRefObject<Map<FieldValidator<any>>>;
  changedFieldRef: MutableRefObject<string | undefined>;
  getNodeValue: GetNodeValue;
  getFormState: GetFormState;
  setDefaultValue: SetDefaultValue;
  setTouchedMaybeValidate: SetTouchedMaybeValidate;
  handleChangeEvent: HandleChangeEvent;
  removeField: RemoveField;
  subscribeObserver: ObserverHandler;
  unsubscribeObserver: ObserverHandler;
  form: RegisterForm;
  field: RegisterField<any>;
  select: Select;
  getState: GetState;
  setValue: SetValue;
  setTouched: SetTouched;
  setDirty: SetDirty;
  setError: SetError;
  clearErrors: ClearErrors;
  runValidation: RunValidation;
  reset: Reset<any>;
  submit: Submit<any>;
}

// useState
type DeepProps<V, T = any> = {
  [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
};

export type FormErrors<V> = DeepProps<V>;

export interface FormState<V> {
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
}

export type StateRef<V> = MutableRefObject<FormState<V>>;

export interface SetStateRef {
  (
    path: string,
    value?: any,
    options?: { fieldPath?: string; shouldUpdate?: boolean }
  ): void;
}

export interface SetUsedState {
  (usedState: Map): void;
}

export interface Observer {
  usedState: Map;
  update: () => void;
}

export interface ObserverHandler {
  (observer: Observer): void;
}

export interface FormStateReturn<V> {
  stateRef: StateRef<V>;
  setStateRef: SetStateRef;
  setUsedState: SetUsedState;
  subscribeObserver: ObserverHandler;
  unsubscribeObserver: ObserverHandler;
}

// useForm
export type FormValues = Map<any>;

export type Handlers = {
  [k in "change" | "blur" | "submit" | "reset"]?: (event: Event) => void;
};

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export interface Field {
  field: FieldElement;
  options?: FieldElement[];
}

export type Fields = Map<Field>;

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

interface ResetHandler<V> {
  (values: V, options: Options<V>, event?: Event | SyntheticEvent): void;
}

export interface SubmitHandler<V> {
  (
    values: V,
    options: Options<V>,
    event?: Event | SyntheticEvent
  ): void | Promise<void>;
}

export interface ErrorHandler<V> {
  (
    errors: FormErrors<V>,
    options: Options<V>,
    event?: Event | SyntheticEvent
  ): void;
}

export interface Debug<V> {
  (formState: FormState<V>): void;
}

interface FormValidator<V> {
  (values: V):
    | FormErrors<V>
    | false
    | void
    | Promise<FormErrors<V> | false | void>;
}

export interface FieldValidator<V> {
  (value: any, values: V): any | Promise<any>;
}

export interface RegisterForm {
  (element: HTMLElement | null): void;
}

export interface RegisterField<V> {
  (
    validateOrOptions:
      | FieldValidator<V>
      | {
          validate?: FieldValidator<V>;
          valueAsNumber?: boolean;
          valueAsDate?: boolean;
          parse?: Parser;
        }
  ): (field: FieldElement | null) => void;
}

export interface HandleChangeEvent {
  (name: string, value: any): void;
}

export interface SetDefaultValue {
  (name: string, value: any): void;
}

export interface RemoveField {
  (name: string): void;
}

export interface SetTouchedMaybeValidate {
  (name: string): void;
}

export interface GetNodeValue {
  (name: string): any;
}

export type Path = string | string[] | Map<string>;

export interface GetFormState {
  (
    path: Path | undefined,
    options: {
      target?: string;
      errorWithTouched?: boolean;
      methodName?: string;
      callback?: (usedState: Map) => void;
    }
  ): any;
}

export interface Select {
  (path: Path, options?: { target?: string; errorWithTouched?: boolean }): any;
}

export interface GetState {
  (path?: string | string[] | Map<string>, target?: string): any;
}

export interface SetValue {
  (
    name: string,
    value?: any | ((previousValue: any) => any),
    options?: {
      [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
    }
  ): void;
}

export interface SetTouched {
  (name: string, isTouched?: boolean, shouldValidate?: boolean): void;
}

export interface SetDirty {
  (name: string, isDirty?: boolean): void;
}

export interface SetError {
  (name: string, error?: any | ((previousError?: any) => any)): void;
}

export interface ClearErrors {
  (name?: string | string[]): void;
}

export interface RunValidation {
  (name?: string | string[]): Promise<boolean>;
}

export interface Reset<V> {
  (
    values?: V | ((previousValues: V) => V) | null,
    exclude?: (keyof FormState<V>)[] | null,
    event?: SyntheticEvent
  ): void;
}

export interface Submit<V> {
  (event?: SyntheticEvent): Promise<{
    values?: V;
    errors?: FormErrors<V>;
  }>;
}

interface Parser {
  (...args: any[]): any;
}

export type Parsers = Map<{
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  parse?: Parser;
}>;

export type FormConfig<V> = Partial<{
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

export interface FormReturn<V> {
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

// useFormState
export interface StateConfig {
  formId: string;
  target?: string;
  errorWithTouched?: boolean;
}

// useControlled
interface Formatter {
  (value: any): any;
}

interface BlurHandler {
  (event: FocusEvent): void;
}

export interface ControlledConfig<V> {
  formId: string;
  defaultValue?: any;
  validate?: FieldValidator<V>;
  parse?: Parser;
  format?: Formatter;
  errorWithTouched?: boolean;
  [k: string]: any;
}

export interface FieldProps<E extends any[]> {
  name: string;
  value: any;
  onChange: (...args: E) => void;
  onBlur: BlurHandler;
  [k: string]: any;
}

export interface Meta {
  error: any;
  isTouched: boolean;
  isDirty: boolean;
}

export type ControlledReturn<E extends any[]> = [FieldProps<E>, Meta];
