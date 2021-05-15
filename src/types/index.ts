import { FocusEventHandler, MutableRefObject, SyntheticEvent } from "react";

// Utils
export type ObjMap<T = boolean> = Record<string, T>;

// Global
export type Methods<V = any> = {
  validateOnChange: boolean;
  shouldRemoveField: ShouldRemoveField;
  initialStateRef: MutableRefObject<FormState<V>>;
  fieldArrayRef: MutableRefObject<FieldArray>;
  controlsRef: MutableRefObject<ObjMap>;
  observersRef: MutableRefObject<Observer<V>[]>;
  fieldValidatorsRef: MutableRefObject<ObjMap<FieldValidator<V>>>;
  changedFieldRef: MutableRefObject<string | undefined>;
  setStateRef: SetStateRef;
  getNodeValue: GetNodeValue;
  getFormState: GetFormState<V>;
  setDefaultValue: SetDefaultValue;
  setNodesOrValues: SetNodesOrValues<V>;
  setTouchedMaybeValidate: SetTouchedMaybeValidate;
  handleChangeEvent: HandleChangeEvent;
} & FormMethods<V>;

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
    options?: {
      fieldPath?: string;
      shouldSkipUpdate?: boolean;
      shouldForceUpdate?: boolean;
    }
  ): void;
}

export interface Observer<V> {
  usedState: ObjMap;
  notify: (state: FormState<V>) => void;
}

export interface FormStateReturn<V> {
  stateRef: MutableRefObject<FormState<V>>;
  setStateRef: SetStateRef;
  observersRef: MutableRefObject<Observer<V>[]>;
}

// useForm
export type FormValues = ObjMap<any>;

export type Handlers = {
  [k in "change" | "blur" | "submit" | "reset"]?: (event: Event) => void;
};

export type FieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Map<
  string,
  {
    field: FieldElement;
    options?: (HTMLInputElement | HTMLOptionElement)[];
  }
>;

export type FieldArray = ObjMap<{ fields: ObjMap; reset: () => void }>;

interface EventOptions<V> {
  removeField: RemoveField;
  getState: GetState;
  setValue: SetValue;
  setError: SetError;
  setTouched: SetTouched;
  setDirty: SetDirty;
  clearErrors: ClearErrors;
  runValidation: RunValidation;
  focus: Focus;
  reset: Reset<V>;
  submit: Submit<V>;
}

export type FieldNamesLike =
  | boolean
  | string[]
  | ((names: string[]) => string[]);

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

export interface OnStateChange<V> {
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

export interface FieldValidator<V> {
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

export interface SetNodesOrValues<V> {
  (values: V, options?: { shouldSetValues?: boolean; fields?: string[] }): void;
}

export interface SetTouchedMaybeValidate {
  (name: string): void;
}

export interface ShouldRemoveField {
  (name: string): boolean;
}

export interface GetNodeValue {
  (name: string, fields?: Fields): any;
}

export type Path = string | string[] | ObjMap<string>;

export interface GetFormState<V> {
  (
    path?: Path,
    options?: {
      errorWithTouched?: boolean;
      defaultValues?: V;
      methodName?: string;
      callback?: (usedState: ObjMap) => void;
    }
  ): any;
}

export interface Use<V> {
  (
    path: Path,
    options?: { defaultValues?: V; errorWithTouched?: boolean }
  ): any;
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

export interface GetState {
  (path?: string | string[] | ObjMap<string>): any;
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

export type Parsers = ObjMap<{
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
  focusOnError: FieldNamesLike;
  removeOnUnmounted: FieldNamesLike;
  builtInValidationMode: "message" | "state" | false;
  excludeFields: string[];
  onReset: ResetHandler<V>;
  onSubmit: SubmitHandler<V>;
  onError: ErrorHandler<V>;
  onStateChange: OnStateChange<V>;
}>;

export interface FormMethods<V = any> {
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

// useFormState
export type FormStateConfig<V = any> = Partial<{
  formId: string;
  defaultValues: V;
  errorWithTouched: boolean;
}>;

export interface FormStateCallback {
  (props: any): void;
}

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

export interface StateHandler {
  (fields: any[], type: Keys, lastIndex: number): any[];
}

type HelperOptions = Partial<{
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

export type FieldArrayConfig<T = any, V = any> = Partial<{
  formId: string;
  defaultValue: T[];
  validate: FieldValidator<V>;
}>;

export type FieldArrayReturn<T> = [
  string[],
  {
    push: Push<T>;
    insert: Insert<T>;
    remove: Remove<T>;
    swap: Swap;
    move: Move;
  }
];
