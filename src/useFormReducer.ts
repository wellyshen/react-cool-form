import { Reducer, useReducer } from "react";

import { DefaultValues, FormState, FormAction, FormActionType } from "./types";

const reducer = <T>(
  state: FormState<T>,
  { type, payload }: FormAction
): FormState<T> => {
  switch (type) {
    case FormActionType.SET_VALUES:
      return { ...state, values: { ...state.values, ...payload } };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <T>(
  defaultValues: DefaultValues
): ReturnType<typeof useReducer> =>
  useReducer<Reducer<FormState<T>, FormAction>>(reducer, {
    errors: {},
    values: defaultValues,
  });
