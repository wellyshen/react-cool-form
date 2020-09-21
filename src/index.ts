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

const getInputs = (form: HTMLFormElement) =>
  Array.from(form.querySelectorAll("input,textarea,select"))
    .filter((element) => {
      const input = element as InputElements;

      if (!input.name) {
        warnNoFieldName();
        return false;
      }
      if (
        !/TEXTAREA|SELECT/.test(input.tagName) &&
        /hidden|image|file|submit|reset/.test(input.type)
      )
        return false;

      return true;
    })
    .reduce((acc, cur) => {
      acc[(cur as InputElements).name] = cur;
      return acc;
    }, {} as Record<string, any>);

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {},
}: Options = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputsRef = useRef({});
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
    const { current: inputs } = inputsRef;

    if (!inputs) return;

    Object.keys(inputs).forEach((key) => {
      const input = (inputs as Record<string, InputElements>)[key];
      const { tagName, name, type, value } = input;
      const val = defaultValues[name];

      if (type === "checkbox") {
        (input as HTMLInputElement).checked =
          value && Array.isArray(val) ? val.includes(value) : !!val;
      } else if (
        tagName === "SELECT" &&
        (input as HTMLSelectElement).multiple &&
        Array.isArray(val)
      ) {
        Array.from((input as HTMLSelectElement).options).forEach((option) => {
          option.selected = !!val.includes(option.value);
        });
      } else if (type === "radio") {
        (input as HTMLInputElement).checked = value === val;
      } else {
        input.value = val;
      }
    });
  }, [defaultValues]);

  useEffect(() => {
    if (!formRef.current) return;

    inputsRef.current = getInputs(formRef.current);
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
