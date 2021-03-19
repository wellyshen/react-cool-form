import { FocusEventHandler, MutableRefObject, SyntheticEvent } from "react";

// Utils
export type Map<T = boolean> = Record<string, T>;

// Global
export type Methods = {
  validateOnChange: boolean;
  shouldRemoveField: boolean;
  defaultValuesRef: MutableRefObject<any>;
  initialStateRef: MutableRefObject<FormState>;
  excludeFieldsRef: MutableRefObject<Map>;
  fieldArrayRef: MutableRefObject<FieldArray>;
  controlledsRef: MutableRefObject<Map>;
  fieldValidatorsRef: MutableRefObject<Map<FieldValidator>>;
  changedFieldRef: MutableRefObject<string | undefined>;
  setStateRef: SetStateRef;
  getNodeValue: GetNodeValue;
  getFormState: GetFormState;
  setDefaultValue: SetDefaultValue;
  setTouchedMaybeValidate: SetTouchedMaybeValidate;
  handleChangeEvent: HandleChangeEvent;
  removeField: RemoveField;
  subscribeObserver: ObserverHandler;
  unsubscribeObserver: ObserverHandler;
} & FormMethods;

// useState
type DeepProps<V, T = any> = {
  [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
};

export type FormErrors<V> = DeepProps<V>;

export interface FormState<V = any> {
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
  stateRef: MutableRefObject<FormState<V>>;
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
  options?: (HTMLInputElement | HTMLOptionElement)[];
}

export type Fields = Map<Field>;

export type FieldArray = Map<{ fields: Map; reset: () => void }>;

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

interface ResetHandler<V> {
  (values: V, options: EventOptions<V>, event?: Event | SyntheticEvent): void;
}

export interface SubmitHandler<V = any> {
  (
    values: V,
    options: EventOptions<V>,
    event?: Event | SyntheticEvent
  ): void | Promise<void>;
}

export interface ErrorHandler<V = any> {
  (
    errors: FormErrors<V>,
    options: EventOptions<V>,
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

export interface RegisterForm {
  (element: HTMLElement | null): void;
}

export interface FieldValidator<V = any> {
  (value: any, values: V): any | Promise<any>;
}

interface FieldParser {
  (value: any): any;
}

export interface RegisterField<V = any> {
  (
    validateOrOptions:
      | FieldValidator<V>
      | {
          validate?: FieldValidator<V>;
          valueAsNumber?: boolean;
          valueAsDate?: boolean;
          parse?: FieldParser;
        }
  ): (field: FieldElement | null) => void;
}

export interface HandleChangeEvent {
  (name: string, value: any): void;
}

export interface SetDefaultValue {
  (name: string, value: any, shouldUpdateDefaultValue?: boolean): void;
}

export interface RemoveField {
  (name: string): void;
}

export interface SetTouchedMaybeValidate {
  (name: string): void;
}

export interface GetNodeValue {
  (name: string, fields?: Fields): any;
}

export type Path = string | string[] | Map<string>;

export interface GetFormState<V = any> {
  (
    path: Path | undefined,
    options: {
      target?: string;
      errorWithTouched?: boolean;
      defaultValues?: V;
      methodName?: string;
      callback?: (usedState: Map) => void;
    }
  ): any;
}

export interface Watch<V> {
  (
    path: Path,
    options?: { target?: string; defaultValues?: V; errorWithTouched?: boolean }
  ): any;
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

export interface Reset<V = any> {
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

export type Parsers = Map<{
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  parse?: FieldParser;
}>;

export type FormConfig<V = any> = Partial<{
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

export interface FormMethods<V = any> {
  form: RegisterForm;
  field: RegisterField<V>;
  mon: Watch<V>;
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
export type FormStateConfig<V = any> = Partial<{
  formId: string;
  target: string;
  defaultValues: V;
  errorWithTouched: boolean;
}>;

// useControlled
interface ControlledParser {
  (...args: any[]): any;
}

interface ControlledFormatter {
  (value: any): any;
}

export type ControlledConfig<V = any> = Partial<{
  formId: string;
  defaultValue: any;
  validate: FieldValidator<V>;
  parse: ControlledParser;
  format: ControlledFormatter;
  errorWithTouched: boolean;
  [k: string]: any;
}>;

export interface FieldProps {
  name: string;
  value: any;
  onChange: (...event: any[]) => void;
  onBlur: FocusEventHandler;
  [k: string]: any;
}

export interface Meta {
  error: any;
  isTouched: boolean;
  isDirty: boolean;
}

export type ControlledReturn = [FieldProps, Meta];

// useFieldArray
export type Keys = "values" | "touched" | "errors" | "dirty";

export interface HelperHandler {
  (value: any[], type: Keys, lastIndex?: number): any[];
}

type HelperOptions = Partial<{
  shouldTouched: boolean;
  shouldDirty: boolean;
}>;

export interface Push<T> {
  (value: T, options?: HelperOptions): void;
}

export interface Insert<T> {
  (index: number, value: T, options?: HelperOptions): void;
}

export interface Remove<T> {
  (index: number): T | void;
}

export interface Swap {
  (indexA: number, indexB: number): void;
}

export interface Move {
  (from: number, to: number): void;
}

export type FieldArrayConfig<T, V> = Partial<{
  formId: string;
  defaultValue: T[];
  validate: FieldValidator<V>;
}>;

export type FieldArrayReturn<T> = [
  T[],
  {
    push: Push<T>;
    insert: Insert<T>;
    remove: Remove<T>;
    swap: Swap;
    move: Move;
  }
];
