import { ChangeEvent } from "react";

// Common
export interface Obj {
  [key: string]: any;
}

// Reducer
export interface State<T> {
  values: T | Record<string, unknown>;
}

export enum ActionType {
  SET_VALUES = "SET_VALUES",
}

export type Action = {
  type: ActionType.SET_VALUES;
  payload: Obj;
};

// useForm
export interface Opts {
  defaultValues?: Obj;
}

interface GetInputProps {
  (name: string): {
    name: string;
    value: any;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
}

export interface Return<T> {
  getFieldProps: GetInputProps;
  formState: State<T>;
}
