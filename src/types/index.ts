import { RefObject } from "react";

// Common
export type DefaultValues = Record<string, any>;

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

export type FieldElements =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type Fields = Record<string, FieldElements>;

export interface Options {
  defaultValues?: DefaultValues;
}

export interface SetValues<T> {
  (keyOrValues: string | T, value?: any): void;
}

export interface Return<T> extends FormState<T> {
  formRef: RefObject<HTMLFormElement>;
  setValues: SetValues<T>;
}
