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

  const setDefaultValues = useCallback(() => {
    if (!formRef.current) return;

    Array.from(formRef.current.querySelectorAll("input,textarea,select"))
      .filter(
        (element) =>
          /TEXTAREA|SELECT/.test(element.tagName) ||
          !/hidden|image|file|submit|reset/.test(
            (element as HTMLInputElement).type
          )
      )
      .forEach((element) => {
        const input = element as InputElements;
        const { type, name, value } = input;

        if (!name) {
          warnNoFieldName();
          return;
        }

        const val = defaultValues[name];

        if (type === "checkbox") {
          // eslint-disable-next-line no-param-reassign
          (input as HTMLInputElement).checked =
            value && Array.isArray(val) ? val.includes(value) : !!val;
        } else {
          input.value = val;
        }
      });
  }, [defaultValues]);

  useEffect(() => {
    setDefaultValues();
  }, [setDefaultValues]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;

    const handleChange = (e: Event) => {
      const { name, value } = e.target as InputElements;

      if (!name) {
        warnNoFieldName();
        return;
      }

      setValues(name, value);
    };

    form.addEventListener("input", handleChange);

    return () => {
      form.removeEventListener("input", handleChange);
    };
  }, [setValues]);

  return { formRef, values: state.values, errors: state.errors, setValues };
};

export default useForm;
