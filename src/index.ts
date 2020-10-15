import { useRef, useCallback, useEffect } from "react";

import {
  Config,
  Return,
  FormValues,
  Errors,
  Fields,
  FieldElement,
  ValidateCallback,
  ValidateRef,
  SetFieldValue,
  SetFieldError,
} from "./types";
import useLatest from "./useLatest";
import useFormState from "./useFormState";
import {
  warn,
  get,
  set,
  isNumberField,
  isRangeField,
  isCheckboxField,
  isRadioField,
  isMultipleSelectField,
  isFileField,
  isFunction,
  isObject,
  isEmptyObject,
  isArray,
} from "./utils";

const isFieldElement = ({ tagName }: HTMLElement) =>
  /INPUT|TEXTAREA|SELECT/.test(tagName);

const hasChangeEvent = ({ type }: FieldElement) =>
  !/hidden|image|submit|reset/.test(type);

const getFields = (form: HTMLFormElement | null, fields: Fields = {}) =>
  form
    ? [...form.querySelectorAll("input,textarea,select")]
        .filter((element) => {
          const field = element as FieldElement;
          if (!field.name) {
            warn('💡react-cool-form: Field is missing "name" attribute.');
            return false;
          }
          if (fields[field.name]) return false;
          return hasChangeEvent(field);
        })
        .reduce((acc, cur) => {
          const { name, type } = cur as FieldElement;
          acc[name] = { ...acc[name], field: cur };
          if (/checkbox|radio/.test(type)) {
            acc[name].options = acc[name].options
              ? [...acc[name].options, cur]
              : [cur];
          }
          return acc;
        }, {} as Record<string, any>)
    : {};

const useForm = <V extends FormValues = FormValues>({
  defaultValues,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
}: Config<V>): Return<V> => {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultValuesRef = useLatest(defaultValues || {});
  const formValidationRef = useLatest(validate);
  const fieldValidationsRef = useRef<Record<string, ValidateCallback<V>>>({});
  const fieldsRef = useRef<Fields>({});
  const changedFieldRef = useRef("");
  const [formState, stateRef, setStateRef] = useFormState<V>(
    defaultValuesRef.current
  );

  const validateRef = useCallback<ValidateRef<V>>(
    (callback) => (field) => {
      if (field?.name) fieldValidationsRef.current[field.name] = callback;
    },
    []
  );

  const setFieldError = useCallback<SetFieldError>(
    (name, error) => {
      const err = isFunction(error)
        ? error(get(stateRef.current.errors, name))
        : error;

      setStateRef(`errors.${name}`, err);
    },
    [stateRef, setStateRef]
  );

  const runFormValidation = useCallback(async (): Promise<Errors<V>> => {
    if (!formValidationRef.current) return {};

    try {
      const errors = await formValidationRef.current(
        stateRef.current.values,
        setFieldError
      );

      return isObject(errors) ? (errors as Errors<V>) : {};
    } catch (error) {
      warn(`💡react-cool-form > validate form: `, error);
      return error;
    }
  }, [formValidationRef, stateRef, setFieldError]);

  const runFieldValidation = useCallback(
    async (name: string): Promise<Errors<V>> => {
      if (!fieldValidationsRef.current[name]) return {};

      try {
        const { values, errors } = stateRef.current;
        const error = await fieldValidationsRef.current[name](
          get(values, name),
          values
        );

        return set(errors, name, error);
      } catch (error) {
        warn(`💡react-cool-form > validate ${name}: `, error);
        return error;
      }
    },
    [stateRef]
  );

  const setDomValue = useCallback((name: string, value: any) => {
    const target = fieldsRef.current[name];

    if (!target || !document.body.contains(target.field)) return;

    const { field, options } = target;

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

  const setValuesToDom = useCallback(
    (
      fields: Fields = fieldsRef.current,
      values: V = defaultValuesRef.current
    ) =>
      Object.keys(fields).forEach((key) => {
        const { name } = fields[key].field;
        setDomValue(name, get(values, name));
      }),
    [defaultValuesRef, setDomValue]
  );

  const setFieldTouched = useCallback(
    (name: string, shouldValidate = validateOnBlur) => {
      setStateRef(`touched.${name}`, true);

      if (shouldValidate && changedFieldRef.current !== name) {
        // TODO: Validate
      }
    },
    [setStateRef, validateOnBlur]
  );

  const setFieldValue = useCallback<SetFieldValue>(
    (name, value, shouldValidate = validateOnChange) => {
      const val = isFunction(value)
        ? value(get(stateRef.current.values, name))
        : value;

      setStateRef(`values.${name}`, val);
      setDomValue(name, val);
      setFieldTouched(name, false);

      if (shouldValidate) {
        // TODO: Validate
      }
    },
    [validateOnChange, stateRef, setStateRef, setDomValue, setFieldTouched]
  );

  useEffect(() => {
    if (!formRef.current) {
      warn(
        '💡react-cool-form: Don\'t forget to register your form via the "formRef".'
      );
      return;
    }

    fieldsRef.current = getFields(formRef.current);
    setValuesToDom();
  }, [formRef, setValuesToDom]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const handleChange = (e: Event) => {
      const field = e.target as FieldElement;
      const { name, value } = field;

      if (!name) {
        warn('💡react-cool-form: Field is missing "name" attribute.');
        return;
      }

      let val: any = value;

      if (isNumberField(field) || isRangeField(field)) {
        val = parseFloat(value) || "";
      } else if (isCheckboxField(field)) {
        let checkValues: any = get(stateRef.current.values, name);

        if (field.hasAttribute("value") && isArray(checkValues)) {
          checkValues = new Set(checkValues);

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

      setStateRef(`values.${name}`, val);
      changedFieldRef.current = name;

      if (validateOnChange) {
        // TODO: Validate
      }
    };

    const handleBlur = ({ target }: Event) => {
      if (
        !isFieldElement(target as HTMLElement) ||
        !hasChangeEvent(target as HTMLInputElement)
      )
        return;

      setFieldTouched((target as FieldElement).name);
      changedFieldRef.current = "";
    };

    const form = formRef.current;

    form.addEventListener("input", handleChange);
    form.addEventListener("focusout", handleBlur);

    const observer = new MutationObserver((mutations) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const { type, addedNodes } of mutations) {
        if (type === "childList" && addedNodes.length) {
          const addedFields = getFields(form, fieldsRef.current);

          if (!isEmptyObject(addedFields)) {
            fieldsRef.current = { ...fieldsRef.current, ...addedFields };
            setValuesToDom(addedFields);
          }

          break;
        }
      }
    });
    observer.observe(form, { childList: true, subtree: true });

    return () => {
      form.removeEventListener("input", handleChange);
      form.removeEventListener("focusout", handleBlur);
      observer.disconnect();
    };
  }, [
    formRef,
    stateRef,
    setStateRef,
    validateOnChange,
    setFieldTouched,
    setValuesToDom,
  ]);

  return {
    formRef,
    validate: validateRef,
    formState,
    setFieldValue,
    setFieldError,
  };
};

export default useForm;
