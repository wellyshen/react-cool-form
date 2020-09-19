import { useRef, useCallback, useEffect } from "react";

import {
  FormActionType,
  FieldValues,
  Options,
  Return,
  InputElements,
  SetValues,
} from "./types";
import useFormReducer from "./useFormReducer";

const throwFieldNameWarn = () => {
  if (__DEV__)
    console.warn('💡react-cool-form: Field is missing "name" attribute');
};

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {},
}: Options = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, dispatch] = useFormReducer<T>(defaultValues);

  const setValues = useCallback<SetValues>(
    (keyOrValues, value) =>
      dispatch({
        type: FormActionType.SET_VALUES,
        payload:
          typeof keyOrValues === "string"
            ? { [keyOrValues]: value }
            : keyOrValues,
      }),
    [dispatch]
  );

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;

    Array.from(form.children).forEach((child) => {
      if (!/INPUT|SELECT|TEXTAREA/.test(child.tagName)) return;
      if (!child.hasAttribute("name")) throwFieldNameWarn();
    });

    const handleChange = (e: Event) => {
      const target = e.target as InputElements;

      if (!target.name) throwFieldNameWarn();

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
