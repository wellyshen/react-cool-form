import { RefObject } from "react";

// Common
type DefaultValues = Record<string, unknown>;

type Errors = Record<string, any>;

// Reducer
export interface State<T> {
  values: T | DefaultValues;
  errors: Errors;
}

export enum ActionType {
  SET_VALUES = "SET_VALUES",
}

export type Action = {
  type: ActionType.SET_VALUES;
  payload: Record<string, any>;
};

// Hook
export type Values = Record<string, any>;

export interface Opts {
  defaultValues?: DefaultValues;
}

export interface Return<T> extends State<T> {
  formRef: RefObject<HTMLFormElement>;
}

export interface SetValues {
  (keyOrValues: string | Record<string, any>, value: any): void;
}

export type InputEls =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;
