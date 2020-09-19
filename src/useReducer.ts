import { Reducer, useReducer } from "react";

import { DefaultValues, State, Action, ActionType } from "./types";

const initialState = { errors: {} };
const reducer = <T>(state: State<T>, { type, payload }: Action): State<T> => {
  switch (type) {
    case ActionType.SET_VALUES:
      return { ...state, values: { ...state.values, ...payload } };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <T>(
  defaultValues: DefaultValues
): ReturnType<typeof useReducer> =>
  useReducer<Reducer<State<T>, Action>>(reducer, {
    ...initialState,
    values: defaultValues,
  });
