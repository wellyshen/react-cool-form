import { Reducer, useReducer } from "react";

import {
  DefaultValues,
  FormState,
  FormAction,
  FormActionType,
  OnValuesChange,
} from "./types";

const createReducer = <T>(onValuesChange: OnValuesChange<T>) => (
  state: FormState<T>,
  { type, payload }: FormAction
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
  defaultValues: DefaultValues,
  onValuesChange: OnValuesChange<T>
): ReturnType<typeof useReducer> =>
  useReducer<Reducer<FormState<T>, FormAction>>(createReducer(onValuesChange), {
    errors: {},
    values: defaultValues,
  });
