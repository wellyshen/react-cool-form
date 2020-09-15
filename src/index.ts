import { Reducer, useReducer, useCallback } from "react";

import { Obj, State, Action, ActionType, Opts, Return } from "./types";

const initialState = { errors: {} };
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
}: Opts = {}): Return => {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action>>(reducer, {
    ...initialState,
    values: defaultValues,
  });

  const setValue = useCallback((key, val) => {
    dispatch({ type: ActionType.SET_VALUES, payload: { [key]: val } });
  }, []);

  const getInputProps = useCallback(
    (name, { required }) => ({
      name,
      value: state.values[name],
      // eslint-disable-next-line react-hooks/rules-of-hooks
      onChange: useCallback((e) => setValue(name, e.target.value), [name]),
    }),
    [state.values, setValue]
  );

  return { getInputProps };
};

export default useForm;
