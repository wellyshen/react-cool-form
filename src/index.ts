import { useRef, useCallback, useEffect } from "react";

import {
  Options,
  Return,
  FormActionType,
  Fields,
  FieldValues,
  FieldElements,
  SetValues,
} from "./types";
import useFormReducer from "./useFormReducer";
import {
  isCheckbox,
  isRadio,
  isMultipleSelect,
  isFile,
  isString,
} from "./utils";

const warnNoFieldName = () => {
  if (__DEV__)
    console.warn('💡react-cool-form: Field is missing "name" attribute');
};

const getFields = (form: HTMLFormElement | null) =>
  form
    ? [...form.querySelectorAll("input,textarea,select")]
        .filter((element) => {
          const field = element as FieldElements;

          if (!field.name) {
            warnNoFieldName();
            return false;
          }
          if (/hidden|image|submit|reset/.test(field.type)) return false;

          return true;
        })
        .reduce((acc, cur) => {
          acc[(cur as FieldElements).name] = cur;
          return acc;
        }, {} as Record<string, any>)
    : {};

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {},
}: Options = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fieldsRef = useRef<Fields>({});
  const [state, dispatch] = useFormReducer<T>(defaultValues);

  const setFieldValue = useCallback((name: string, value: any) => {
    const field = fieldsRef.current[name];

    if (!field) return;

    if (isCheckbox(field)) {
      (field as HTMLInputElement).checked =
        field.value && Array.isArray(value)
          ? value.includes(field.value)
          : !!value;
    } else if (isRadio(field)) {
      (field as HTMLInputElement).checked = field.value === value;
    } else if (isMultipleSelect(field) && Array.isArray(value)) {
      [...(field as HTMLSelectElement).options].forEach((option) => {
        option.selected = !!value.includes(option.value);
      });
    } else if (isFile(field) && !isString(value)) {
      (field as HTMLInputElement).files = value;
    } else {
      field.value = value;
    }
  }, []);

  const setValues = useCallback<SetValues>(
    (keyOrValues, value) =>
      dispatch({
        type: FormActionType.SET_VALUES,
        payload: isString(keyOrValues)
          ? { [keyOrValues as string]: value }
          : keyOrValues,
      }),
    [dispatch]
  );

  const setDefaultValues = useCallback(
    (fields: Fields = getFields(formRef.current)) =>
      Object.keys(fields).forEach((key) => {
        const { name } = fields[key];

        setFieldValue(name, defaultValues[name]);
      }),
    [setFieldValue, defaultValues]
  );

  useEffect(() => {
    if (!formRef.current) {
      if (__DEV__)
        console.warn(
          '💡react-cool-form: Don\'t forget to register your form with the "formRef"'
        );
      return;
    }

    fieldsRef.current = getFields(formRef.current);
    setDefaultValues(fieldsRef.current);
  }, [setDefaultValues]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const form = formRef.current;

    const handleChange = (e: Event) => {
      const { name, value } = e.target as FieldElements;

      if (!name) {
        warnNoFieldName();
        return;
      }

      // TODO: handle more cases...

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
