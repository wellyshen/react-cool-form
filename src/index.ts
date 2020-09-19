import { useRef, useCallback, useEffect } from "react";

import { ActionType, Values, Opts, Return, InputEls, SetValues } from "./types";
import useReducer from "./useReducer";

const fieldNoNameWarn = '💡react-cool-form: Field is missing "name" attribute';

const useForm = <T extends Values = Values>({
  defaultValues = {},
}: Opts = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, dispatch] = useReducer<T>(defaultValues);

  const setValues = useCallback<SetValues>(
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

  return { formRef, values: state.values, errors: state.errors, setValues };
};

export default useForm;
