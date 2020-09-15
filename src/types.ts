import { ChangeEvent } from "react";

// Common
export interface Obj {
  [key: string]: any;
}

// Reducer
export interface State<T> {
  values: T | Record<string, unknown>;
  errors: Obj;
}

export enum ActionType {
  SET_VALUES = "SET_VALUES",
  SET_ERRORS = "SET_ERRORS",
}

export type Action =
  | {
      type: ActionType.SET_VALUES;
      payload: Obj;
    }
  | {
      type: ActionType.SET_ERRORS;
      payload: Obj;
    };

// useForm
export interface Opts {
  defaultValues?: Obj;
}

interface GetInputPropsOpts {
  required?: boolean | string;
}

interface GetInputPropsReturn {
  name: string;
  value: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface GetInputProps {
  (name: string, options?: GetInputPropsOpts): GetInputPropsReturn;
}

export interface Return {
  getInputProps: GetInputProps;
}
