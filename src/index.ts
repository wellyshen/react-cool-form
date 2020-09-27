import { useRef, useCallback, useEffect } from "react";

import {
  Config,
  Return,
  FormState,
  FormActionType,
  FormElement,
  Fields,
  FieldValues,
  FieldElement,
  Values,
  ValueFn,
  SetFieldValue,
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
  isFunction,
  isArray,
} from "./utils";

const warnNoFieldName = () => {
  if (__DEV__)
    console.warn('💡react-cool-form: Field is missing "name" attribute');
};

const isFieldElement = ({ tagName }: HTMLElement) =>
  /INPUT|TEXTAREA|SELECT/.test(tagName);

const hasChangeEvent = ({ type }: HTMLInputElement) =>
  !/hidden|image|submit|reset/.test(type);

const getFields = (form: FormElement) =>
  form
    ? [...form.querySelectorAll("input,textarea,select")]
        .filter((element) => {
          const field = element as FieldElement;
          if (!field.name) warnNoFieldName();
          return field.name && hasChangeEvent(field as HTMLInputElement);
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
  formRef: configFormRef,
  defaultValues = {},
}: Config<T>): Return<T> => {
  const fieldsRef = useRef<Fields>({});
  const { current: initialState } = useRef<FormState<T>>({
    values: defaultValues,
    touched: {},
  });
  const stateRef = useRef<FormState<T>>(initialState);
  const [state, dispatch] = useFormState<T>(initialState, (s) => {
    stateRef.current = s;
  });
  const varFormRef = useRef<FormElement>(null);
  const formRef = configFormRef || varFormRef;

  const refreshFieldsIfNeeded = useCallback(
    (name: string) => {
      if (formRef.current && !fieldsRef.current[name])
        fieldsRef.current = getFields(formRef.current);
    },
    [formRef]
  );

  const setDomValue = useCallback((name: string, value: any) => {
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

  const setDomDefaultValues = useCallback(
    (
      fields: Fields = getFields(formRef.current),
      values: Values<T> = defaultValues
    ) =>
      Object.keys(fields).forEach((key) => {
        const { name } = fields[key].field;
        setDomValue(name, values[name]);
      }),
    [formRef, setDomValue, defaultValues]
  );

  const setFieldValue = useCallback<SetFieldValue<T>>(
    (name, value) => {
      const val = isFunction(value)
        ? (value as ValueFn<T>)(stateRef.current.values[name])
        : value;

      dispatch({ type: FormActionType.SET_FIELD_VALUE, name, value: val });

      refreshFieldsIfNeeded(name as string);
      setDomValue(name as string, val);

      // TODO: validation
    },
    [dispatch, refreshFieldsIfNeeded, setDomValue]
  );

  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      refreshFieldsIfNeeded(name);
      dispatch({
        type: FormActionType.SET_FIELD_TOUCHED,
        name,
        value: isTouched,
      });

      // TODO: validation
    },
    [refreshFieldsIfNeeded, dispatch]
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
    setDomDefaultValues(fieldsRef.current);
  }, [formRef, setDomDefaultValues]);

  useEffect(() => {
    if (!formRef.current) return () => null;

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
        let checkValues: any = stateRef.current.values[name];

        if (checkbox.hasAttribute("value") && isArray(checkValues)) {
          checkValues = new Set(stateRef.current.values[name]);

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

      dispatch({ type: FormActionType.SET_FIELD_VALUE, name, value: val });
    };

    const handleBlur = ({ target }: Event) => {
      if (
        isFieldElement(target as HTMLElement) &&
        hasChangeEvent(target as HTMLInputElement)
      )
        setFieldTouched((target as FieldElement).name);
    };

    const form = formRef.current;

    form.addEventListener("input", handleChange);
    form.addEventListener("focusout", handleBlur);

    return () => {
      form.removeEventListener("input", handleChange);
      form.removeEventListener("focusout", handleBlur);
    };
  }, [formRef, dispatch, setFieldTouched]);

  return {
    formRef,
    values: state.values,
    touched: state.touched,
    setFieldValue,
  };
};

export default useForm;
