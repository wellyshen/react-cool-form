import { Reducer, useRef, useReducer, useCallback, useEffect } from "react";

import {
  State,
  Action,
  ActionType,
  Values,
  Opts,
  Return,
  InputEls,
} from "./types";

const fieldNoNameWarn = '💡react-cool-form: Field is missing "name" attribute';

const initialState = { errors: {} };
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
    (keyOrVals, val) =>
      dispatch({
        type: ActionType.SET_VALUES,
        payload:
          typeof keyOrVals === "string" ? { [keyOrVals]: val } : keyOrVals,
      }),
    []
  );

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;

    const handleChange = (e: Event) => {
      const target = e.target as InputEls;

      if (!target.name && __DEV__) {
        console.warn(fieldNoNameWarn);
        return;
      }

      // @ts-expect-error
      const { type, name, value, checked } = target;

      switch (type) {
        case "checkbox":
          setValues(name, target.hasAttribute("value") ? value : checked);
          break;
        default:
          setValues(name, value);
      }
    };

    form.addEventListener("input", handleChange);

    return () => {
      form.removeEventListener("input", handleChange);
    };
  }, [setValues]);

  return { formRef, values: state.values, errors: state.errors };
};

export default useForm;
