import { useReducer } from "react";

import {
  Values,
  FormState,
  FormActionType,
  FormAction,
  FormReducer,
  OnValuesChange,
} from "./types";

const createReducer = <T>(onValuesChange: OnValuesChange<T>) => (
  state: FormState<T>,
  { type, payload }: FormAction<T>
): FormState<T> => {
  switch (type) {
    case FormActionType.SET_VALUES: {
      const values = { ...state.values, ...payload };
      onValuesChange(values);
      return { ...state, values };
    }
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <T>(
  defaultValues: Values<T>,
  onValuesChange: OnValuesChange<T>
): ReturnType<typeof useReducer> =>
  useReducer<FormReducer<T>>(createReducer(onValuesChange), {
    values: defaultValues,
  });
