import { ChangeEvent } from "react";

export interface Obj {
  [key: string]: any;
}

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

export interface Opts {
  defaultValues?: Obj;
}

export interface Return {
  getInputProps: (
    name: string
  ) => {
    name: string;
    value: any;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
}
