import { useReducer, useEffect } from "react";

import {
  FormState,
  FormActionType,
  FormAction,
  FormReducer,
  OnStateChange,
} from "./types";

const reducer = <V>(
  state: FormState<V>,
  { type, payload }: FormAction<V>
): FormState<V> => {
  switch (type) {
    case FormActionType.SET_FIELD_VALUE:
      return { ...state, values: { ...state.values, ...payload } };
    case FormActionType.SET_FIELD_TOUCHED:
      return { ...state, touched: { ...state.touched, ...payload } };
    case FormActionType.SET_ERRORS:
      return { ...state, errors: payload };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <V>(
  initialState: FormState<V>,
  onStateChange: OnStateChange<V>
): ReturnType<typeof useReducer> => {
  const [state, dispatch] = useReducer<FormReducer<V>>(reducer, initialState);

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);

  return [state, dispatch];
};
