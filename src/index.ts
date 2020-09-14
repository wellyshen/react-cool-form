import {
  Reducer,
  ChangeEvent as RChangeEvent,
  useReducer,
  useCallback,
} from "react";

interface Obj {
  [key: string]: any;
}

interface State<T> {
  values: T | Record<string, unknown>;
}

enum ActionType {
  SET_VALUES = "SET_VALUES",
}

type Action = {
  type: ActionType.SET_VALUES;
  payload: Obj;
};

interface Opts {
  defaultValues?: Obj;
}

type ChangeEvent = RChangeEvent<HTMLInputElement>;

interface Return {
  getInputProps: (
    name: string
  ) => { name: string; value: any; onChange: (event: ChangeEvent) => void };
}

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
      onChange: (e: ChangeEvent): void => setValue(name, e.target.value),
    }),
    [state.values, setValue]
  );

  return { getInputProps };
};
