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

const useForm = <T extends Obj = Obj>({
  defaultValues = {},
}: Opts = {}): Return<T> => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action>>(reducer, {
    ...initialState,
    values: defaultValues,
  });

  const setValues = useCallback(
    (target, val) =>
      dispatch({
        type: ActionType.SET_VALUES,
        payload: typeof target === "string" ? { [target]: val } : target,
      }),
    []
  );

  const handleOnChange = useCallback(
    (e, name) => setValues(name, e.target.value),
    [setValues]
  );

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: state.values[name],
      // eslint-disable-next-line react-hooks/rules-of-hooks
      onChange: useCallback((e) => handleOnChange(e, name), [name]),
    }),
    [state.values, handleOnChange]
  );

  return { getFieldProps, formState: state };
};

export default useForm;
