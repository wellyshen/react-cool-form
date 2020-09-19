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

const warnNoFieldName = () => {
  if (__DEV__)
    console.warn('💡react-cool-form: Field is missing "name" attribute');
};

/* const getCheckboxValue = (
  el: HTMLInputElement,
  currentValue: any
): boolean | string[] => {
  if (!currentValue) {
    // ...
  } else {
    // ...
  }
}; */

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {},
}: Options = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const valuesRef = useRef(defaultValues);
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

  const setDefaultValues = useCallback(() => {
    if (!formRef.current) return;

    Array.from(formRef.current.children).forEach((child) => {
      if (!/INPUT|SELECT|TEXTAREA/.test(child.tagName)) return;

      // @ts-expect-error
      const { type, name, value, checked } = child as InputElements;

      if (!name) {
        warnNoFieldName();
        return;
      }
      if (type === "file") return;

      const val = defaultValues[name] || checked || value;

      if (type === "checkbox") {
        // TODO: handle checkbox value
      }

      setValues(name, val || "");
    });
  }, [defaultValues, setValues]);

  useEffect(() => {
    valuesRef.current = state.values;
  }, [state.values]);

  useEffect(() => {
    setDefaultValues();
  }, [setDefaultValues]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;

    const handleChange = (e: Event) => {
      // @ts-expect-error
      const { name, type, value, checked } = e.target as InputElements;

      if (!name) {
        warnNoFieldName();
        return;
      }

      switch (type) {
        case "checkbox":
          // TODO: handle checkbox value
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
