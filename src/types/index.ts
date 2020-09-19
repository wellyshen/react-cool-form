import { RefObject } from "react";

// Common
export type DefaultValues = Record<string, unknown>;

type Errors = Record<string, any>;

// Reducer
export interface FormState<T> {
  values: T | DefaultValues;
  errors: Errors;
}

export enum FormActionType {
  SET_VALUES = "SET_VALUES",
}

export type FormAction = {
  type: FormActionType.SET_VALUES;
  payload: Record<string, any>;
};

// Hook
export type FieldValues = Record<string, any>;

export type InputElements =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface SetValues {
  (keyOrValues: string | Record<string, any>, value?: any): void;
}

export interface Options {
  defaultValues?: DefaultValues;
}

export interface Return<T> extends FormState<T> {
  formRef: RefObject<HTMLFormElement>;
  setValues: SetValues;
}
