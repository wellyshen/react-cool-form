import { Reducer, useReducer, useCallback } from "react";

import { Obj, State, Action, ActionType, Opts, Return } from "./types";

const initialState = {};
const reducer = <T>(state: State<T>, { type, payload }: Action): State<T> => {
  switch (type) {
    case ActionType.SET_VALUES:
      return { ...state, values: { ...state.values, ...payload } };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

export default <T extends Obj = Obj>({
  defaultValues = {},
}: Opts = {}): Return => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action>>(reducer, {
    ...initialState,
    values: defaultValues,
  });

  const setValue = useCallback((key, val) => {
    dispatch({ type: ActionType.SET_VALUES, payload: { [key]: val } });
  }, []);

  const getInputProps = useCallback(
    (name) => ({
      name,
      value: state.values[name],
      onChange: useCallback((e) => setValue(name, e.target.value), [name]),
    }),
    [state.values, setValue]
  );

  return { getInputProps };
};
