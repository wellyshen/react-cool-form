import { useRef, useCallback, useEffect } from "react";

import {
  Config,
  Return,
  FormState,
  FormActionType,
  Fields,
  FormValues,
  FieldElement,
  SetFieldValue,
} from "./types";
import useLatest from "./useLatest";
import useFormReducer from "./useFormReducer";
import {
  isNumberField,
  isRangeField,
  isCheckboxField,
  isRadioField,
  isMultipleSelectField,
  isFileField,
  isFunction,
  isObject,
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

const getFields = (form: HTMLFormElement | null) =>
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

const useForm = <V extends FormValues = FormValues>({
  defaultValues = {} as V,
  formRef: configFormRef,
  validate,
}: Config<V>): Return<V> => {
  const validateRef = useLatest(validate);
  const fieldsRef = useRef<Fields>({});
  const { current: initialState } = useRef<FormState<V>>({
    values: defaultValues,
    touched: {},
    errors: {},
    isValidating: false,
  });
  const formStateRef = useRef<FormState<V>>(initialState);
  const [formState, dispatch] = useFormReducer<V>(initialState, (state) => {
    formStateRef.current = state;
  });
  const varFormRef = useRef<HTMLFormElement>(null);
  const formRef = configFormRef || varFormRef;

  const refreshFieldsIfNeeded = useCallback(
    (name: string) => {
      if (formRef.current && !fieldsRef.current[name])
        fieldsRef.current = getFields(formRef.current);
    },
    [formRef]
  );

  const validateForm = useCallback(async () => {
    if (!formRef.current || !validateRef.current) return;

    try {
      dispatch({ type: FormActionType.SET_ISVALIDATING, payload: true });
      const errors = await validateRef.current(formRef.current.values);
    } catch (error) {
      // ...
    } finally {
      dispatch({ type: FormActionType.SET_ISVALIDATING, payload: false });
    }
  }, [formRef, validateRef, dispatch]);

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
      [...field.options].forEach((option) => {
        option.selected = !!value.includes(option.value);
      });
    } else if (isFileField(field)) {
      if (isObject(value)) field.files = value;
    } else {
      field.value = value;
    }
  }, []);

  const setFieldValue = useCallback<SetFieldValue<V>>(
    (name, value) => {
      const val = isFunction(value)
        ? value(formStateRef.current.values[name])
        : value;

      dispatch({
        type: FormActionType.SET_FIELD_VALUE,
        payload: { [name]: val },
      });

      refreshFieldsIfNeeded(name as string);
      setDomValue(name as string, val);

      validateForm();
    },
    [refreshFieldsIfNeeded, dispatch, setDomValue, validateForm]
  );

  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      refreshFieldsIfNeeded(name);
      dispatch({
        type: FormActionType.SET_FIELD_TOUCHED,
        payload: { [name]: isTouched },
      });

      validateForm();
    },
    [refreshFieldsIfNeeded, dispatch, validateForm]
  );

  const applyValuesToDom = useCallback(
    (fields: Fields = getFields(formRef.current), values: V = defaultValues) =>
      Object.keys(fields).forEach((key) => {
        const { name } = fields[key].field;
        setDomValue(name, values[name]);
      }),
    [formRef, setDomValue, defaultValues]
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
    applyValuesToDom(fieldsRef.current);
  }, [formRef, applyValuesToDom]);

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
        let checkValues: any = formStateRef.current.values[name];

        if (field.hasAttribute("value") && isArray(checkValues)) {
          checkValues = new Set(formStateRef.current.values[name]);

          if (field.checked) {
            checkValues.add(value);
          } else {
            checkValues.delete(value);
          }

          val = [...checkValues];
        } else {
          val = field.checked;
        }
      } else if (isMultipleSelectField(field)) {
        val = [...field.options]
          .filter((option) => option.selected)
          .map((option) => option.value);
      } else if (isFileField(field)) {
        val = field.files;
      }

      dispatch({
        type: FormActionType.SET_FIELD_VALUE,
        payload: { [name]: val },
      });

      validateForm();
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
  }, [formRef, dispatch, validateForm, setFieldTouched]);

  return { formRef, formState, setFieldValue };
};

export default useForm;
