import { useRef, useCallback, useEffect } from "react";

import {
  Options,
  Return,
  FormActionType,
  Fields,
  FieldValues,
  FieldElement,
  Values,
  SetValue,
} from "./types";
import useFormState from "./useFormState";
import {
  isNumberField,
  isRangeField,
  isCheckboxField,
  isRadioField,
  isMultipleSelectField,
  isFileField,
  isString,
  isArray,
} from "./utils";

const warnNoFieldName = () => {
  if (__DEV__)
    console.warn('💡react-cool-form: Field is missing "name" attribute');
};

const getFields = (form: HTMLFormElement | null) =>
  form
    ? [...form.querySelectorAll("input,textarea,select")]
        .filter((element) => {
          const { name, type } = element as FieldElement;
          if (!name) warnNoFieldName();
          return name && !/hidden|image|submit|reset/.test(type);
        })
        .reduce((fields, field) => {
          const { type, name } = field as FieldElement;
          fields[name] = { ...fields[name], field };
          if (/checkbox|radio/.test(type)) {
            fields[name].options = fields[name].options
              ? [...fields[name].options, field]
              : [field];
          }
          return fields;
        }, {} as Record<string, any>)
    : {};

const useForm = <T extends FieldValues = FieldValues>({
  defaultValues = {},
}: Options<T> = {}): Return<T> => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const fieldsRef = useRef<Fields>({});
  const valuesRef = useRef<Values<T>>(defaultValues);
  const [state, dispatch] = useFormState<T>(defaultValues, (values) => {
    valuesRef.current = values;
  });

  const setFieldValue = useCallback((name: string, value: any) => {
    if (!fieldsRef.current[name]) return;

    const { field, options } = fieldsRef.current[name];

    if (isCheckboxField(field)) {
      const checkboxs = options as HTMLInputElement[];

      if (checkboxs.length > 1) {
        checkboxs.forEach((checkbox) => {
          checkbox.checked = isArray(value)
            ? value.includes(checkbox.value)
            : !!value;
        });
      } else {
        checkboxs[0].checked = !!value;
      }
    } else if (isRadioField(field)) {
      (options as HTMLInputElement[]).forEach((radio) => {
        radio.checked = radio.value === value;
      });
    } else if (isMultipleSelectField(field) && isArray(value)) {
      [...(field as HTMLSelectElement).options].forEach((option) => {
        option.selected = !!value.includes(option.value);
      });
    } else if (isFileField(field) && !isString(value)) {
      (field as HTMLInputElement).files = value;
    } else {
      field.value = value;
    }
  }, []);

  const setValue = useCallback<SetValue<T>>(
    (name, value) => {
      dispatch({ type: FormActionType.SET_VALUES, payload: { [name]: value } });

      // Make sure a dynamic field is registered before setting value
      if (formRef.current && !fieldsRef.current[name as string])
        fieldsRef.current = getFields(formRef.current);
      setFieldValue(name as string, value);

      // TODO: form validation
    },
    [setFieldValue, dispatch]
  );

  const setFormStateValue = useCallback(
    (name: string, value: any) => setValue(name, value),
    [setValue]
  );

  const setDefaultValues = useCallback(
    (
      fields: Fields = getFields(formRef.current),
      values: Values<T> = defaultValues
    ) =>
      Object.keys(fields).forEach((key) => {
        const { name } = fields[key].field;
        setFieldValue(name, values[name]);
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
      const field = e.target as FieldElement;
      const { name, value } = field;

      if (!name) {
        warnNoFieldName();
        return;
      }

      let val: any = value;

      if (isNumberField(field) || isRangeField(field)) {
        val = parseFloat(value) || "";
      } else if (isCheckboxField(field)) {
        const checkbox = field as HTMLInputElement;

        if (checkbox.hasAttribute("value")) {
          const checkValues = new Set(valuesRef.current[name]);

          if (checkbox.checked) {
            checkValues.add(value);
          } else {
            checkValues.delete(value);
          }

          val = [...checkValues];
        } else {
          val = checkbox.checked;
        }
      } else if (isMultipleSelectField(field)) {
        val = [...(field as HTMLSelectElement).options]
          .filter((option) => option.selected)
          .map((option) => option.value);
      } else if (isFileField(field)) {
        val = (field as HTMLInputElement).files;
      }

      setFormStateValue(name, val);
    };

    form.addEventListener("input", handleChange);

    return () => {
      form.removeEventListener("input", handleChange);
    };
  }, [setFormStateValue]);

  return { formRef, values: state.values, setValue };
};

export default useForm;
