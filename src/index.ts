import { useRef, useCallback, useLayoutEffect, useEffect } from "react";
import {
  unstable_LowPriority,
  unstable_runWithPriority,
  unstable_scheduleCallback,
} from "scheduler";

import {
  Config,
  Return,
  FormValues,
  Fields,
  FieldElement,
  Errors,
  ValidateRef,
  FieldValidateFn,
  GetFormState,
  SetValues,
  SetFieldValue,
  SetErrors,
  SetFieldError,
} from "./types";
import useLatest from "./useLatest";
import useFormState from "./useFormState";
import {
  warn,
  get,
  set,
  deepMerge,
  isNumberField,
  isRangeField,
  isCheckboxField,
  isRadioField,
  isMultipleSelectField,
  isFileField,
  isFunction,
  isArray,
  isPlainObject,
  isEmptyObject,
  isUndefined,
} from "./utils";

const runWithLowPriority = (fn: () => any) =>
  unstable_runWithPriority(unstable_LowPriority, () =>
    unstable_scheduleCallback(unstable_LowPriority, fn)
  );

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
        .reduce((acc: Record<string, any>, cur) => {
          const { name, type } = cur as FieldElement;
          acc[name] = { ...acc[name], field: cur };
          if (/checkbox|radio/.test(type)) {
            acc[name].options = acc[name].options
              ? [...acc[name].options, cur]
              : [cur];
          }
          return acc;
        }, {})
    : {};

const useForm = <V extends FormValues = FormValues>({
  defaultValues,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
}: Config<V>): Return<V> => {
  const formRef = useRef<HTMLFormElement>(null);
  const defaultValuesRef = useRef(defaultValues || {});
  const formValidateFnRef = useLatest(validate);
  const fieldValidatesRef = useRef<Record<string, FieldValidateFn<V>>>({});
  const fieldsRef = useRef<Fields>({});
  const changedFieldRef = useRef<string>();
  const [formState, stateRef, setStateRef] = useFormState<V>(
    defaultValuesRef.current
  );

  const validateRef = useCallback<ValidateRef<V>>(
    (validateFn) => (field) => {
      if (field?.name) fieldValidatesRef.current[field.name] = validateFn;
    },
    []
  );

  const getFormState = useCallback<GetFormState>(
    (path) =>
      isUndefined(path) ? stateRef.current : get(stateRef.current, path),
    [stateRef]
  );

  const runFieldValidation = useCallback(
    async (name: string): Promise<Errors<V>> => {
      if (!fieldValidatesRef.current[name]) return {};

      try {
        const error = await fieldValidatesRef.current[name](
          getFormState(`values.${name}`),
          getFormState()
        );

        return error ? set({}, name, error) : {};
      } catch (exception) {
        warn(`💡react-cool-form > validate ${name}: `, exception);
        throw exception;
      }
    },
    [getFormState]
  );

  const runAllFieldsValidation = useCallback((): Promise<Errors<V>> => {
    const promises = Object.keys(fieldValidatesRef.current).map((name) =>
      runFieldValidation(name)
    );

    return Promise.all(promises).then((errors) =>
      errors.reduce((acc, cur) => {
        acc = { ...acc, ...cur };
        return acc;
      }, {})
    );
  }, [runFieldValidation]);

  const runFormValidateFn = useCallback(
    async (name?: string): Promise<Errors<V>> => {
      if (!formValidateFnRef.current) return {};

      try {
        const errors = await formValidateFnRef.current(getFormState("values"), {
          formState: getFormState(),
          set,
        });

        if (!isPlainObject(errors)) return {};
        if (!name) return errors;

        const error = get(errors, name);
        return error ? set({}, name, error) : {};
      } catch (exception) {
        warn(`💡react-cool-form > config.validate: `, exception);
        throw exception;
      }
    },
    [formValidateFnRef, getFormState]
  );

  const validateField = useCallback(
    (name: string) => {
      setStateRef("isValidating", true);

      Promise.all([runFieldValidation(name), runFormValidateFn(name)]).then(
        (errors) => {
          setStateRef("errors", deepMerge(...errors));
          setStateRef("isValidating", false);
        }
      );
    },
    [setStateRef, runFieldValidation, runFormValidateFn]
  );

  const validateForm = useCallback(() => {
    setStateRef("isValidating", true);

    Promise.all([runAllFieldsValidation(), runFormValidateFn()]).then(
      (errors) => {
        setStateRef("errors", deepMerge(...errors));
        setStateRef("isValidating", false);
      }
    );
  }, [setStateRef, runAllFieldsValidation, runFormValidateFn]);

  const validateFormWithLowPriority = useCallback(
    () => runWithLowPriority(validateForm),
    [validateForm]
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
      if (isPlainObject(value)) field.files = value;
    } else {
      field.value = value ?? "";
    }
  }, []);

  const setAllDomsValue = useCallback(
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

      if (shouldValidate && changedFieldRef.current !== name)
        validateFormWithLowPriority();
    },
    [setStateRef, validateOnBlur, validateFormWithLowPriority]
  );

  const setFieldDirty = useCallback(
    (name: string) => {
      setStateRef(
        `dirtyFields.${name}`,
        get(getFormState("values"), name) !== get(defaultValues, name)
      );
    },
    [setStateRef, getFormState, defaultValues]
  );

  const setValues = useCallback<SetValues<V>>(
    (
      values,
      {
        shouldValidate = validateOnChange,
        touchedFields = [],
        dirtyFields = [],
      } = {}
    ) => {
      values = isFunction(values) ? values(getFormState("values")) : values;

      setStateRef("values", values);
      setAllDomsValue(fieldsRef.current, values);

      touchedFields.forEach((name) => setFieldTouched(name, false));
      dirtyFields.forEach((name) => setFieldDirty(name));
      if (shouldValidate) validateFormWithLowPriority();
    },
    [
      validateOnChange,
      getFormState,
      setStateRef,
      setAllDomsValue,
      setFieldTouched,
      setFieldDirty,
      validateFormWithLowPriority,
    ]
  );

  const setFieldValue = useCallback<SetFieldValue>(
    (
      name,
      value,
      {
        shouldValidate = validateOnChange,
        isTouched = true,
        isDirty = true,
      } = {}
    ) => {
      value = isFunction(value) ? value(getFormState(`values.${name}`)) : value;

      setStateRef(`values.${name}`, value);
      setDomValue(name, value);

      if (isTouched) setFieldTouched(name, false);
      if (isDirty) setFieldDirty(name);
      if (shouldValidate) validateFormWithLowPriority();
    },
    [
      validateOnChange,
      getFormState,
      setStateRef,
      setDomValue,
      setFieldTouched,
      setFieldDirty,
      validateFormWithLowPriority,
    ]
  );

  const setErrors = useCallback<SetErrors<V>>(
    (errors) => {
      setStateRef(
        "errors",
        (isFunction(errors) ? errors(getFormState("errors")) : errors) || {}
      );
    },
    [setStateRef, getFormState]
  );

  const setFieldError = useCallback<SetFieldError>(
    (name, error) => {
      setStateRef(
        `errors.${name}`,
        isFunction(error) ? error(getFormState(`errors.${name}`)) : error
      );
    },
    [getFormState, setStateRef]
  );

  useLayoutEffect(() => {
    if (!formRef.current) {
      warn(
        '💡react-cool-form: Don\'t forget to register your form via the "formRef".'
      );
      return;
    }

    fieldsRef.current = getFields(formRef.current);
    setAllDomsValue();
  }, [formRef, setAllDomsValue]);

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
        let checkValues = getFormState(`values.${name}`);

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
      setFieldDirty(name);

      if (validateOnChange) {
        validateFormWithLowPriority();
        changedFieldRef.current = name;
      }
    };

    const handleBlur = ({ target }: Event) => {
      if (
        !isFieldElement(target as HTMLElement) ||
        !hasChangeEvent(target as HTMLInputElement)
      )
        return;

      setFieldTouched((target as FieldElement).name);
      changedFieldRef.current = undefined;
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
            setAllDomsValue(addedFields);
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
    getFormState,
    setStateRef,
    validateOnChange,
    setFieldTouched,
    setFieldDirty,
    setAllDomsValue,
    validateFormWithLowPriority,
  ]);

  return {
    formRef,
    validate: validateRef,
    formState,
    getFormState,
    setValues,
    setFieldValue,
    setErrors,
    setFieldError,
    validateField,
    validateForm,
  };
};

export default useForm;
