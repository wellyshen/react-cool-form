import { useRef, useCallback, useEffect } from "react";
import isEqual from "fast-deep-equal";

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
  const changedFieldRef = useRef("");
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

    dispatch({ type: FormActionType.SET_ISVALIDATING, payload: true });

    try {
      const errors = await validateRef.current(formStateRef.current.values);

      if (!isEqual(errors, formStateRef.current.errors))
        dispatch({ type: FormActionType.SET_ERRORS, payload: errors });
      dispatch({ type: FormActionType.SET_ISVALIDATING, payload: false });
    } catch (error) {
      if (__DEV__) console.warn(`💡react-cool-form > validate form: `, error);
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

  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      refreshFieldsIfNeeded(name);

      if (!formStateRef.current.touched[name])
        dispatch({
          type: FormActionType.SET_FIELD_TOUCHED,
          payload: { [name]: isTouched },
        });

      if (name !== changedFieldRef.current) validateForm();
    },
    [refreshFieldsIfNeeded, dispatch, validateForm]
  );

  const setFieldValue = useCallback<SetFieldValue<V>>(
    (name, value, { shouldValidate = true } = {}) => {
      const key = name as string;
      const val = isFunction(value)
        ? value(formStateRef.current.values[key])
        : value;

      dispatch({
        type: FormActionType.SET_FIELD_VALUE,
        payload: { [key]: val },
      });

      refreshFieldsIfNeeded(key);
      setDomValue(key, val);
      setFieldTouched(key);

      if (shouldValidate) validateForm();
    },
    [
      refreshFieldsIfNeeded,
      dispatch,
      setDomValue,
      setFieldTouched,
      validateForm,
    ]
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
          '💡react-cool-form: Don\'t forget to register your form via the "formRef"'
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
      changedFieldRef.current = name;
    };

    const handleBlur = ({ target }: Event) => {
      if (
        isFieldElement(target as HTMLElement) &&
        hasChangeEvent(target as HTMLInputElement)
      ) {
        setFieldTouched((target as FieldElement).name);
        changedFieldRef.current = "";
      }
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
