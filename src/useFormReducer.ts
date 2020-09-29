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
  action: FormAction<V>
): FormState<V> => {
  switch (action.type) {
    case FormActionType.SET_FIELD_VALUE:
      return { ...state, values: { ...state.values, ...action.payload } };
    case FormActionType.SET_FIELD_TOUCHED:
      return { ...state, touched: { ...state.touched, ...action.payload } };
    case FormActionType.SET_ISVALIDATING:
      return { ...state, isValidating: action.payload };
    case FormActionType.SET_ERRORS:
      return { ...state, errors: action.payload };
    default:
      return state;
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
