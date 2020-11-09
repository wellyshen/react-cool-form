import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  unstable_LowPriority,
  unstable_runWithPriority,
  unstable_scheduleCallback,
} from "scheduler";

import {
  Config,
  Controller,
  EventHandler,
  Errors,
  FieldElement,
  Fields,
  FieldValidator,
  FormValues,
  GetState,
  Reset,
  Return,
  SetErrors,
  SetFieldError,
  SetFieldValue,
  SetValues,
  UsedRef,
  ValidateRef,
  ValidateField,
  ValidateForm,
} from "./types";
import useLatest from "./useLatest";
import useFormState from "./useFormState";
import {
  deepMerge,
  get,
  isArray,
  isCheckboxField,
  isEmptyObject,
  isFileField,
  isFunction,
  isKey,
  isMultipleSelectField,
  isNumberField,
  isPlainObject,
  isRadioField,
  isRangeField,
  isUndefined,
  set,
  warn,
} from "./utils";

const useUniversalLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const arrayToObject = (arr: any[]): Record<string, boolean> =>
  arr.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});

const isFieldElement = ({ tagName }: HTMLElement) =>
  /INPUT|TEXTAREA|SELECT/.test(tagName);

const hasChangeEvent = ({ type }: FieldElement) =>
  !/hidden|image|submit|reset/.test(type);

const getFields = (form: HTMLFormElement | null) =>
  form
    ? Array.from(form.querySelectorAll("input,textarea,select"))
        .filter((element) => {
          const field = element as FieldElement;
          const { name, dataset } = field;

          if (!hasChangeEvent(field)) return false;
          if (!name) {
            warn('💡 react-cool-form: Field is missing "name" attribute.');
            return false;
          }
          if (dataset.rcfIgnore) return false;

          return true;
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
  initialValues,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  ignoreFields = [],
  onReset,
  onSubmit,
  onError,
  debug,
}: Config<V>): Return<V> => {
  const formRef = useRef<HTMLFormElement>(null);
  const fieldsRef = useRef<Fields>({});
  const formValidatorRef = useLatest(validate);
  const fieldValidatorsRef = useRef<Record<string, FieldValidator<V>>>({});
  const onResetRef = useLatest(onReset);
  const onSubmitRef = useLatest(onSubmit);
  const onErrorRef = useLatest(onError);
  const ignoreFieldsRef = useRef<UsedRef>(arrayToObject(ignoreFields));
  const changedFieldRef = useRef<string>();
  const {
    stateRef,
    setStateRef,
    resetStateRef,
    setUsedStateRef,
  } = useFormState<V>(initialValues, debug);

  const setDomValue = useCallback((name: string, value: any) => {
    if (ignoreFieldsRef.current[name] || !fieldsRef.current[name]) return;

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
      Array.from(field.options).forEach((option) => {
        option.selected = !!value.includes(option.value);
      });
    } else if (isFileField(field)) {
      if (isPlainObject(value)) field.files = value;
      if (!value) field.value = "";
    } else {
      field.value = value ?? "";
    }
  }, []);

  const setAllDomsValue = useCallback(
    (values: V = stateRef.current.values) =>
      Object.keys(fieldsRef.current).forEach((key) => {
        const { name } = fieldsRef.current[key].field;
        setDomValue(name, get(values, name));
      }),
    [setDomValue, stateRef]
  );

  const validateRef = useCallback<ValidateRef<V>>(
    (validate) => (field) => {
      if (field?.name && !ignoreFieldsRef.current[field.name])
        fieldValidatorsRef.current[field.name] = validate;
    },
    []
  );

  const getState = useCallback<GetState>(
    (path, watch = true) => {
      let state;

      if (isArray(path)) {
        if (watch) path.forEach((p) => setUsedStateRef(p));
        state = path.map((p) => get(stateRef.current, p));
      } else if (isPlainObject(path)) {
        const paths = path as Record<string, string>;
        const keys = Object.keys(paths);

        if (watch) keys.forEach((key) => setUsedStateRef(paths[key]));
        state = keys.reduce((state: Record<string, any>, key) => {
          state[key] = get(stateRef.current, paths[key]);
          return state;
        }, {});
      } else {
        if (watch) setUsedStateRef(path);
        state = get(stateRef.current, path);
      }

      return state;
    },
    [setUsedStateRef, stateRef]
  );

  const setErrors = useCallback<SetErrors<V>>(
    (errors) => {
      setStateRef(
        "errors",
        (isFunction(errors) ? errors(stateRef.current.errors) : errors) || {}
      );
    },
    [setStateRef, stateRef]
  );

  const setFieldError = useCallback<SetFieldError>(
    (name, error) => {
      error = isFunction(error)
        ? error(get(stateRef.current.errors, name))
        : error;

      if (isKey(name) && !error) {
        setErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };
          delete nextErrors[name];
          return nextErrors;
        });
      } else {
        setStateRef(`errors.${name}`, error || undefined);
      }
    },
    [setErrors, setStateRef, stateRef]
  );

  const runFieldValidation = useCallback(
    async (name: string): Promise<any> => {
      if (!fieldValidatorsRef.current[name]) return undefined;

      try {
        const error = await fieldValidatorsRef.current[name](
          get(stateRef.current.values, name),
          stateRef.current.values
        );

        return error;
      } catch (exception) {
        warn(`💡 react-cool-form > validate ${name}: `, exception);
        throw exception;
      }
    },
    [stateRef]
  );

  const runAllFieldsValidation = useCallback((): Promise<Errors<V>> => {
    const promises = Object.keys(fieldValidatorsRef.current).map((name) =>
      runFieldValidation(name)
    );
    const names = Object.keys(fieldValidatorsRef.current);

    return Promise.all(promises).then((errors) =>
      names.reduce((acc, cur, idx) => {
        acc = { ...acc, ...(errors[idx] ? set({}, cur, errors[idx]) : {}) };
        return acc;
      }, {})
    );
  }, [runFieldValidation]);

  const runFormValidation = useCallback(
    async (name?: string): Promise<any> => {
      if (!formValidatorRef.current) return name ? undefined : {};

      try {
        const errors = await formValidatorRef.current(
          stateRef.current.values,
          set
        );

        if (name) return get(errors, name);

        return isPlainObject(errors) ? errors : {};
      } catch (exception) {
        warn(`💡 react-cool-form > config.validate: `, exception);
        throw exception;
      }
    },
    [formValidatorRef, stateRef]
  );

  const validateField = useCallback<ValidateField<V>>(
    async (name) => {
      setStateRef("isValidating", true);

      try {
        const error =
          (await runFormValidation(name)) || (await runFieldValidation(name));

        if (error) setStateRef(`errors.${name}`, error);
        setStateRef("isValidating", false);
        return error;
      } catch (exception) {
        return exception;
      }
    },
    [runFieldValidation, runFormValidation, setStateRef]
  );

  const validateForm = useCallback<ValidateForm<V>>(() => {
    setStateRef("isValidating", true);

    return Promise.all([runAllFieldsValidation(), runFormValidation()]).then(
      (errors) => {
        const errs = deepMerge(...errors);
        setErrors(errs);
        setStateRef("isValidating", false);
        return errs;
      }
    );
  }, [runAllFieldsValidation, runFormValidation, setErrors, setStateRef]);

  const validateFormWithLowPriority = useCallback(
    () =>
      unstable_runWithPriority(unstable_LowPriority, () =>
        unstable_scheduleCallback(unstable_LowPriority, validateForm as any)
      ),
    [validateForm]
  );

  const setFieldTouched = useCallback(
    (name: string, shouldValidate = validateOnBlur) => {
      setStateRef(`touched.${name}`, true);

      if (shouldValidate) validateFormWithLowPriority();
      changedFieldRef.current = undefined;
    },
    [setStateRef, validateFormWithLowPriority, validateOnBlur]
  );

  const setFieldTouchedIfNeeded = useCallback(
    (name: string) =>
      setFieldTouched(
        name,
        (validateOnBlur &&
          validateOnChange &&
          name !== changedFieldRef.current) ||
          undefined
      ),
    [setFieldTouched, validateOnBlur, validateOnChange]
  );

  const setFieldDirty = useCallback(
    (name: string) => {
      setStateRef(
        `dirtyFields.${name}`,
        get(stateRef.current.values, name) !== get(initialValues, name)
      );
    },
    [initialValues, setStateRef, stateRef]
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
      values = isFunction(values) ? values(stateRef.current.values) : values;

      setStateRef("values", values);
      setAllDomsValue(values);

      touchedFields.forEach((name) => setFieldTouched(name, false));
      dirtyFields.forEach((name) => setFieldDirty(name));
      if (shouldValidate) validateFormWithLowPriority();
    },
    [
      setAllDomsValue,
      setFieldDirty,
      setFieldTouched,
      setStateRef,
      stateRef,
      validateFormWithLowPriority,
      validateOnChange,
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
      value = isFunction(value)
        ? value(get(stateRef.current.values, name))
        : value;

      setStateRef(`values.${name}`, value);
      setDomValue(name, value);

      if (isTouched) setFieldTouched(name, false);
      if (isDirty) setFieldDirty(name);
      if (shouldValidate) validateFormWithLowPriority();
      changedFieldRef.current = name;
    },
    [
      setDomValue,
      setFieldDirty,
      setFieldTouched,
      setStateRef,
      stateRef,
      validateFormWithLowPriority,
      validateOnChange,
    ]
  );

  const reset = useCallback<Reset<V>>(
    (values, exclude = []) => {
      resetStateRef(
        isFunction(values) ? values(stateRef.current.values) : values,
        exclude,
        (nextValues) => setAllDomsValue(nextValues)
      );
    },
    [resetStateRef, setAllDomsValue, stateRef]
  );

  const getOptions = useCallback(
    () => ({
      getState: ((path, watch = false) => getState(path, watch)) as GetState,
      setErrors,
      setFieldError,
      setValues,
      setFieldValue,
      validateForm,
      validateField,
      reset,
    }),
    [
      getState,
      reset,
      setErrors,
      setFieldError,
      setFieldValue,
      setValues,
      validateField,
      validateForm,
    ]
  );

  const handleReset = useCallback<EventHandler>(
    (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      reset();

      if (onResetRef.current)
        onResetRef.current(stateRef.current.values, getOptions(), e);
    },
    [getOptions, onResetRef, reset, stateRef]
  );

  const handleSubmit = useCallback<EventHandler>(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      setStateRef("isSubmitting", true);

      try {
        const errors = await validateForm();

        if (onSubmitRef.current && isEmptyObject(errors)) {
          await onSubmitRef.current(stateRef.current.values, getOptions(), e);
          setStateRef("isSubmitted", true);
        } else if (onErrorRef.current) {
          onErrorRef.current(stateRef.current.errors, getOptions(), e);
        }
      } catch (exception) {
        warn(`💡 react-cool-form > handleSubmit: `, exception);
      } finally {
        setStateRef("isSubmitting", false);
      }
    },
    [getOptions, onErrorRef, onSubmitRef, setStateRef, stateRef, validateForm]
  );

  const getChangeEventValue = useCallback(
    (field: FieldElement) => {
      const { name, value } = field;
      let val: any = value;

      if (isNumberField(field) || isRangeField(field)) {
        val = parseFloat(value) || "";
      } else if (isCheckboxField(field)) {
        let checkValues = get(stateRef.current.values, name);

        if (field.hasAttribute("value") && isArray(checkValues)) {
          checkValues = new Set(checkValues);

          if (field.checked) {
            checkValues.add(value);
          } else {
            checkValues.delete(value);
          }

          val = Array.from(checkValues);
        } else {
          val = field.checked;
        }
      } else if (isMultipleSelectField(field)) {
        val = Array.from(field.options)
          .filter((option) => option.selected)
          .map((option) => option.value);
      } else if (isFileField(field)) {
        val = field.files;
      }

      return val;
    },
    [stateRef]
  );

  const handleFieldChange = useCallback(
    (field: FieldElement) => {
      const { name } = field;

      setStateRef(`values.${name}`, getChangeEventValue(field));
      setFieldDirty(name);

      if (validateOnChange) validateFormWithLowPriority();
      changedFieldRef.current = name;
    },
    [
      getChangeEventValue,
      setFieldDirty,
      setStateRef,
      validateFormWithLowPriority,
      validateOnChange,
    ]
  );

  const controller = useCallback<Controller<V>>(
    (name, { validate, value, parser, onChange, onBlur } = {}) => {
      if (!name) {
        warn('💡 react-cool-form > controller: Missing the "name" parameter.');
        return {};
      }

      ignoreFieldsRef.current[name] = true;
      if (validate) fieldValidatorsRef.current[name] = validate;

      return {
        name,
        value: !isUndefined(value) ? value : getState(`values.${name}`),
        // eslint-disable-next-line react-hooks/rules-of-hooks
        onChange: useCallback(
          (e) => {
            const parsedE = parser ? parser(e) : e;

            if (
              parsedE.nativeEvent instanceof Event &&
              isFieldElement(parsedE.target)
            ) {
              handleFieldChange(parsedE.target);
              if (onChange) onChange(e, getChangeEventValue(parsedE.target));
            } else {
              setFieldValue(name, parsedE);
              if (onChange) onChange(e);
            }
          },
          [parser, name, onChange]
        ),
        // eslint-disable-next-line react-hooks/rules-of-hooks
        onBlur: useCallback(
          (e) => {
            setFieldTouchedIfNeeded(name);
            if (onBlur) onBlur(e);
          },
          [name, onBlur]
        ),
      };
    },
    [
      getChangeEventValue,
      getState,
      handleFieldChange,
      setFieldTouchedIfNeeded,
      setFieldValue,
    ]
  );

  useUniversalLayoutEffect(() => {
    if (!formRef.current) {
      warn(
        '💡 react-cool-form: Don\'t forget to register your form via the "formRef".'
      );
      return;
    }

    fieldsRef.current = getFields(formRef.current);
    setAllDomsValue();
  }, [setAllDomsValue]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const handleChange = ({ target }: Event) => {
      const field = target as FieldElement;
      const { name } = field;

      if (!name) {
        warn('💡 react-cool-form: Field is missing "name" attribute.');
        return;
      }

      if (fieldsRef.current[name] && !ignoreFieldsRef.current[name])
        handleFieldChange(field);
    };

    const handleBlur = ({ target }: Event) => {
      if (
        !isFieldElement(target as HTMLElement) ||
        !hasChangeEvent(target as HTMLInputElement)
      )
        return;

      const { name } = target as FieldElement;

      if (fieldsRef.current[name] && !ignoreFieldsRef.current[name])
        setFieldTouchedIfNeeded(name);
    };

    const form = formRef.current;

    form.addEventListener("input", handleChange);
    form.addEventListener("focusout", handleBlur);

    const observer = new MutationObserver((mutations) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const { type, addedNodes } of mutations) {
        if (type === "childList" && addedNodes.length) {
          fieldsRef.current = getFields(form);
          setAllDomsValue();

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
  }, [handleFieldChange, setAllDomsValue, setFieldTouchedIfNeeded]);

  return {
    formRef,
    validate: validateRef,
    getState,
    setErrors,
    setFieldError,
    setValues,
    setFieldValue,
    validateForm,
    validateField,
    reset,
    handleReset,
    handleSubmit,
    controller,
  };
};

export default useForm;
