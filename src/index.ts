import { Reducer, useRef, useReducer, useCallback, useEffect } from "react";

import {
  ChangeEvent,
  State,
  Action,
  ActionType,
  Values,
  Opts,
  Return,
} from "./types";

const initialState = {};
const reducer = <T>(state: State<T>, { type, payload }: Action): State<T> => {
  switch (type) {
    case ActionType.SET_VALUES:
      return { ...state, values: { ...state.values, ...payload } };
    default:
      throw new Error(`Unknown action: ${type}`);
  }
};

const useForm = <T extends Values = Values>({
  defaultValues = {},
}: Opts = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, dispatch] = useReducer<Reducer<State<T>, Action>>(reducer, {
    ...initialState,
    values: defaultValues,
  });

  const setValues = useCallback(
    (keyOrVal, val) =>
      dispatch({
        type: ActionType.SET_VALUES,
        payload: typeof keyOrVal === "string" ? { [keyOrVal]: val } : keyOrVal,
      }),
    []
  );

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;
    const handleChange: any = (e: ChangeEvent) => {
      if (!e.target.name && __DEV__) {
        console.error('💡react-cool-form: Field is missing "name" attribute');
        return;
      }

      // @ts-expect-error
      const { type, name, value, checked } = e.target;

      // TODO: handle checkbox case

      if (type === "checkbox" && !value) {
        setValues(name, checked);
      } else {
        setValues(name, value);
      }
    };

    form.addEventListener("input", handleChange);

    return () => {
      form.removeEventListener("input", handleChange);
    };
  }, [setValues]);

  return { formRef, values: state.values };
};

export default useForm;
