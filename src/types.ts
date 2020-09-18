import { RefObject, ChangeEvent as RChangeEvent } from "react";

// Common
type DefaultValues = Record<string, unknown>;

export type ChangeEvent = RChangeEvent<HTMLInputElement | HTMLSelectElement>;

// Reducer
export interface State<T> {
  values: T | DefaultValues;
}

export enum ActionType {
  SET_VALUES = "SET_VALUES",
}

export type Action = {
  type: ActionType.SET_VALUES;
  payload: Record<string, any>;
};

// useForm
export type Values = Record<string, any>;

export interface Opts {
  defaultValues?: DefaultValues;
}

export interface Return<T> {
  formRef: RefObject<HTMLFormElement>;
  values: T | DefaultValues;
}
