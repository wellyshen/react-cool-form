import { useReducer, useEffect } from "react";

import {
  FormState,
  FormActionType,
  FormAction,
  FormReducer,
  OnStateChange,
} from "./types";

const reducer = <T>(
  state: FormState<T>,
  { type, name, value }: FormAction
): FormState<T> => {
  switch (type) {
    case FormActionType.SET_FIELD_VALUE:
      return { ...state, values: { ...state.values, [name]: value } };
    case FormActionType.SET_FIELD_TOUCHED:
      return { ...state, touched: { ...state.touched, [name]: value } };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <T>(
  initialState: FormState<T>,
  onStateChange: OnStateChange<T>
): ReturnType<typeof useReducer> => {
  const [state, dispatch] = useReducer<FormReducer<T>>(reducer, initialState);

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);

  return [state, dispatch];
};
