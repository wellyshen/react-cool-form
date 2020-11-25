import { useCallback, useEffect, useRef } from "react";

import {
  Config,
  Controller,
  Errors,
  FieldElement,
  Fields,
  FieldValidator,
  FormState,
  FormValues,
  GetState,
  Map,
  Reset,
  Return,
  SetErrors,
  SetFieldError,
  SetFieldValue,
  SetValues,
  Submit,
  ValidateRef,
  ValidateField,
  ValidateForm,
} from "./types";
import useLatest from "./useLatest";
import useState from "./useState";
import {
  arrayToMap,
  deepMerge,
  filterError,
  get,
  isArray,
  isCheckboxField,
  isEmptyObject,
  isFieldElement,
  isFileField,
  isFileList,
  isFunction,
  isMultipleSelectField,
  isNumberField,
  isPlainObject,
  isRadioField,
  isRangeField,
  isUndefined,
  runWithLowPriority,
  set,
  unset,
  useUniversalLayoutEffect,
  warn,
} from "./utils";

export default <V extends FormValues = FormValues>({
  defaultValues,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  ignoreFields = [],
  getTouchedErrorOnly = true,
  onReset,
  onSubmit,
  onError,
  debug,
}: Config<V>): Return<V> => {
  const isInitRef = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldsRef = useRef<Fields>({});
  const controllersRef = useRef<Map>({});
  const ignoreFieldsRef = useRef<Map>(arrayToMap(ignoreFields));
  const changedFieldRef = useRef<string>();
  const formValidatorRef = useLatest(validate);
  const fieldValidatorsRef = useRef<Record<string, FieldValidator<V>>>({});
  const onResetRef = useLatest(onReset || (() => undefined));
  const onSubmitRef = useLatest(onSubmit || (() => undefined));
  const onErrorRef = useLatest(onError || (() => undefined));
  const prevBuiltInErrorsRef = useRef<Record<string, string>>({});
  const initialStateRef = useRef<FormState<V>>({
    values: defaultValues || {},
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  });
  const { stateRef, setStateRef, setUsedStateRef } = useState<V>(
    initialStateRef.current,
    debug
  );

  const getFields = useCallback(
    (form: HTMLFormElement) =>
      Array.from(form.querySelectorAll("input,textarea,select"))
        .filter((element) => {
          const field = element as FieldElement;
          const { type, name, dataset } = field;

          if (/image|submit|reset/.test(type)) return false;
          if (!name) {
            warn('💡 react-cool-form: Field is missing "name" attribute.');
            return false;
          }

          return (
            controllersRef.current[name] ||
            !(dataset.rcfIgnore || ignoreFieldsRef.current[name])
          );
        })
        .reduce((acc: Record<string, any>, cur) => {
          const field = cur as FieldElement;
          const { name } = field;

          acc[name] = { ...acc[name], field: cur };

          if (isCheckboxField(field) || isRadioField(field))
            acc[name].options = acc[name].options
              ? [...acc[name].options, cur]
              : [cur];

          return acc;
        }, {}),
    []
  );

  const validateRef = useCallback<ValidateRef<V>>(
    (validate) => (field) => {
      if (
        field?.name &&
        !controllersRef.current[field.name] &&
        !ignoreFieldsRef.current[field.name]
      )
        fieldValidatorsRef.current[field.name] = validate;
    },
    []
  );

  const getNodeValue = useCallback(
    (field: FieldElement, options?: FieldElement[]) => {
      let value = field.value as any;

      if (isNumberField(field) || isRangeField(field))
        value = value ? parseFloat(value) : "";

      if (isCheckboxField(field)) {
        if (options) {
          const checkboxs = options as HTMLInputElement[];

          if (options.length > 1) {
            value = checkboxs
              .filter((checkbox) => checkbox.checked)
              .map((checkbox) => checkbox.value);
          } else {
            value = checkboxs[0].checked;
          }
        } else {
          let checkValues = get(stateRef.current.values, field.name);

          if (isArray(checkValues)) {
            checkValues = new Set(checkValues);

            if (field.checked) {
              checkValues.add(value);
            } else {
              checkValues.delete(value);
            }

            value = Array.from(checkValues);
          } else {
            value = field.checked;
          }
        }
      }

      if (isRadioField(field) && options)
        value =
          (options as HTMLInputElement[]).find((radio) => radio.checked)
            ?.value || "";

      if (isMultipleSelectField(field) && !options)
        value = Array.from(field.options)
          .filter((option) => option.selected)
          .map((option) => option.value);

      if (isFileField(field)) value = field.files;

      return value;
    },
    [stateRef]
  );

  const setNodeValue = useCallback((name: string, value: any) => {
    if (!fieldsRef.current[name] || controllersRef.current[name]) return;

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
      if (isFileList(value)) field.files = value;
      if (!value) field.value = "";
    } else {
      field.value = value ?? "";
    }
  }, []);

  const setDefaultValue = useCallback(
    (name: string, value: any) => {
      if (isUndefined(get(initialStateRef.current.values, name)))
        initialStateRef.current.values = set(
          initialStateRef.current.values,
          name,
          value,
          true
        );

      if (isUndefined(get(stateRef.current.values, name)))
        setStateRef(
          `values.${name}`,
          get(initialStateRef.current.values, name),
          { shouldUpdate: !isInitRef.current }
        );
    },
    [setStateRef, stateRef]
  );

  const setAllNodesOrStateValue = useCallback(
    (values: V, checkDefaultValue = false) =>
      Object.values(fieldsRef.current).forEach(({ field, options }) => {
        const { name } = field;

        if (controllersRef.current[name]) return;

        const value = get(values, name);

        if (!isUndefined(value)) setNodeValue(name, value);
        if (checkDefaultValue)
          setDefaultValue(name, getNodeValue(field, options));
      }),
    [getNodeValue, setNodeValue, setDefaultValue]
  );

  const getState = useCallback<GetState>(
    (path, watch = true) => {
      const touchedErrorEnhancer = (path: string, state: any) => {
        if (!getTouchedErrorOnly || !watch || !path.startsWith("errors"))
          return state;

        path = path.replace("errors", "touched");
        setUsedStateRef(path);

        return filterError(state, get(stateRef.current, path));
      };
      let state;

      if (isArray(path)) {
        state = path.map((path) => {
          if (watch) setUsedStateRef(path);
          return touchedErrorEnhancer(path, get(stateRef.current, path));
        });
      } else if (isPlainObject(path)) {
        const paths = path as Record<string, string>;
        state = Object.keys(paths).reduce((state: Record<string, any>, key) => {
          const path = paths[key];
          if (watch) setUsedStateRef(path);
          state[key] = touchedErrorEnhancer(path, get(stateRef.current, path));
          return state;
        }, {});
      } else {
        if (watch) setUsedStateRef(path);
        state = touchedErrorEnhancer(path, get(stateRef.current, path));
      }

      return state;
    },
    [getTouchedErrorOnly, setUsedStateRef, stateRef]
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

      if (error) {
        setStateRef(`errors.${name}`, error);
      } else {
        setStateRef("errors", unset(stateRef.current.errors, name, true), {
          fieldPath: `errors.${name}`,
        });
      }
    },
    [setStateRef, stateRef]
  );

  const runBuiltInValidation = useCallback((name: string) => {
    if (!fieldsRef.current[name]) return undefined;

    let error = fieldsRef.current[name].field.validationMessage;
    error =
      name === changedFieldRef.current
        ? error
        : error || prevBuiltInErrorsRef.current[name];

    prevBuiltInErrorsRef.current[name] = error;

    return error;
  }, []);

  const runAllBuiltInValidation = useCallback(
    () =>
      Object.keys(fieldsRef.current).reduce((errors, name) => {
        const error = runBuiltInValidation(name);
        errors = { ...errors, ...(error ? set({}, name, error) : {}) };
        return errors;
      }, {}),
    [runBuiltInValidation]
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

    return Promise.all(promises).then((errors) =>
      Object.keys(fieldValidatorsRef.current).reduce((acc, cur, idx) => {
        acc = { ...acc, ...(errors[idx] ? set({}, cur, errors[idx]) : {}) };
        return acc;
      }, {})
    );
  }, [runFieldValidation]);

  const runFormValidation = useCallback(
    async (name?: string): Promise<any> => {
      if (!formValidatorRef.current) return name ? undefined : {};

      try {
        const errors = await formValidatorRef.current(stateRef.current.values);

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
          (await runFormValidation(name)) ||
          (await runFieldValidation(name)) ||
          runBuiltInValidation(name);

        if (error) {
          setStateRef(`errors.${name}`, error);
        } else {
          setStateRef("errors", unset(stateRef.current.errors, name, true), {
            fieldPath: `errors.${name}`,
          });
        }
        setStateRef("isValidating", false);

        return error;
      } catch (exception) {
        return exception;
      }
    },
    [
      runBuiltInValidation,
      runFieldValidation,
      runFormValidation,
      setStateRef,
      stateRef,
    ]
  );

  const validateFieldWithLowPriority = useCallback<ValidateField<V>>(
    (name) => runWithLowPriority(() => validateField(name)),
    [validateField]
  );

  const validateForm = useCallback<ValidateForm<V>>(() => {
    setStateRef("isValidating", true);

    return Promise.all([
      runAllBuiltInValidation(),
      runAllFieldsValidation(),
      runFormValidation(),
    ]).then((errors) => {
      const errs = deepMerge(...errors);

      setErrors(errs);
      setStateRef("isValidating", false);

      return errs;
    });
  }, [
    runAllBuiltInValidation,
    runAllFieldsValidation,
    runFormValidation,
    setErrors,
    setStateRef,
  ]);

  const validateFormWithLowPriority = useCallback<ValidateForm<V>>(
    () => runWithLowPriority(validateForm),
    [validateForm]
  );

  const setFieldDirty = useCallback(
    (name: string) => {
      if (get(stateRef.current.values, name) !== get(defaultValues, name)) {
        setStateRef(`dirtyFields.${name}`, true);
      } else {
        setStateRef(
          "dirtyFields",
          unset(stateRef.current.dirtyFields, name, true),
          { fieldPath: `errors.${name}` }
        );
      }
    },
    [defaultValues, setStateRef, stateRef]
  );

  const setFieldTouched = useCallback(
    (name: string, shouldValidate = validateOnBlur) => {
      setStateRef(`touched.${name}`, true);

      if (shouldValidate) validateFieldWithLowPriority(name);
      changedFieldRef.current = undefined;
    },
    [setStateRef, validateFieldWithLowPriority, validateOnBlur]
  );

  const setFieldTouchedMaybeValidate = useCallback(
    (name) =>
      setFieldTouched(
        name,
        validateOnChange ? name !== changedFieldRef.current : undefined
      ),
    [setFieldTouched, validateOnChange]
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
      setAllNodesOrStateValue(values);

      touchedFields.forEach((name) => setFieldTouched(name, false));
      dirtyFields.forEach((name) => setFieldDirty(name));
      if (shouldValidate) validateFormWithLowPriority();
    },
    [
      setAllNodesOrStateValue,
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
        shouldTouched = true,
        shouldDirty = true,
      } = {}
    ) => {
      value = isFunction(value)
        ? value(get(stateRef.current.values, name))
        : value;

      setStateRef(`values.${name}`, value);
      setNodeValue(name, value);

      if (shouldTouched) setFieldTouched(name, false);
      if (shouldDirty) setFieldDirty(name);
      if (shouldValidate) validateFieldWithLowPriority(name);
      changedFieldRef.current = name;
    },
    [
      setFieldDirty,
      setFieldTouched,
      setNodeValue,
      setStateRef,
      stateRef,
      validateFieldWithLowPriority,
      validateOnChange,
    ]
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
    }),
    [
      getState,
      setErrors,
      setFieldError,
      setFieldValue,
      setValues,
      validateField,
      validateForm,
    ]
  );

  const reset = useCallback<Reset<V>>(
    (values, exclude, e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const state = { ...stateRef.current };
      const skip = arrayToMap(exclude || []);

      Object.keys(state).forEach((key) => {
        if (skip[key]) return;

        if (key === "values") {
          values =
            (isFunction(values) ? values(stateRef.current.values) : values) ||
            initialStateRef.current.values;

          state[key] = values;
          setAllNodesOrStateValue(values);
        } else {
          // @ts-expect-error
          state[key] = initialStateRef.current[key];
        }
      });

      setStateRef("", state);
      onResetRef.current(state.values, getOptions(), e);
    },
    [getOptions, onResetRef, setAllNodesOrStateValue, setStateRef, stateRef]
  );

  const submit = useCallback<Submit<V>>(
    async (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const touched = Object.keys(fieldsRef.current).reduce((acc: Map, key) => {
        acc = set(acc, key, true);
        return acc;
      }, {});

      setStateRef("touched", touched);
      setStateRef("isSubmitting", true);

      try {
        const errors = await validateForm();
        const options = { ...getOptions(), reset };

        if (!isEmptyObject(errors)) {
          onErrorRef.current(errors, options, e);

          return { errors };
        }

        await onSubmitRef.current(stateRef.current.values, options, e);
        setStateRef("isSubmitted", true);

        return { values: stateRef.current.values };
      } catch (exception) {
        warn(`💡 react-cool-form > submit: `, exception);
        throw exception;
      } finally {
        setStateRef("isSubmitting", false);
      }
    },
    [
      getOptions,
      onErrorRef,
      onSubmitRef,
      reset,
      setStateRef,
      stateRef,
      validateForm,
    ]
  );

  const handleFieldChange = useCallback(
    (field: FieldElement) => {
      const { name } = field;
      const value = getNodeValue(field);

      setStateRef(`values.${name}`, value);
      setFieldDirty(name);

      if (validateOnChange) validateFieldWithLowPriority(name);
      changedFieldRef.current = name;

      return value;
    },
    [
      getNodeValue,
      setFieldDirty,
      setStateRef,
      validateFieldWithLowPriority,
      validateOnChange,
    ]
  );

  const controller = useCallback<Controller<V>>(
    (
      name,
      { validate, value, defaultValue, parse, format, onChange, onBlur } = {}
    ) => {
      if (!name) {
        warn('💡 react-cool-form > controller: Missing the "name" parameter.');
        return {};
      }

      controllersRef.current[name] = true;
      if (validate) fieldValidatorsRef.current[name] = validate;
      if (!isUndefined(defaultValue)) setDefaultValue(name, defaultValue);

      value = !isUndefined(value) ? value : getState(`values.${name}`);
      value = (format ? format(value) : value) ?? "";

      return {
        name,
        value,
        onChange: (e) => {
          const parsedE = parse ? parse(e) : e;
          let value;

          if (
            parsedE.nativeEvent instanceof Event &&
            isFieldElement(parsedE.target)
          ) {
            value = handleFieldChange(parsedE.target);
          } else {
            setFieldValue(name, parsedE, { shouldTouched: false });
          }

          if (onChange) onChange(e, value);
        },
        onBlur: (e) => {
          setFieldTouchedMaybeValidate(name);
          if (onBlur) onBlur(e);
        },
      };
    },
    [
      getState,
      handleFieldChange,
      setDefaultValue,
      setFieldTouchedMaybeValidate,
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
    setAllNodesOrStateValue(initialStateRef.current.values, true);
    isInitRef.current = false;
  }, [getFields, setAllNodesOrStateValue]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const handleChange = ({ target }: Event) => {
      const field = target as FieldElement;
      const { name } = field;

      if (!name) {
        warn('💡 react-cool-form: Field is missing "name" attribute.');
        return;
      }

      if (fieldsRef.current[name] && !controllersRef.current[name])
        handleFieldChange(field);
    };

    const handleBlur = ({ target }: Event) => {
      if (!isFieldElement(target as HTMLElement)) return;

      const { name } = target as FieldElement;

      if (fieldsRef.current[name] && !controllersRef.current[name])
        setFieldTouchedMaybeValidate(name);
    };

    const handleSubmit = (e: Event) => submit(e as any);

    const handleReset = (e: Event) => reset(null, null, e as any);

    const form = formRef.current;
    form.addEventListener("input", handleChange);
    form.addEventListener("focusout", handleBlur);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);

    const observer = new MutationObserver(([{ type }]) => {
      if (type !== "childList") return;

      const fields = getFields(form);
      let { values } = stateRef.current;

      Object.keys(fieldsRef.current).forEach((name) => {
        if (fields[name]) return;

        values = unset(values, name, true);
        setStateRef("values", values, { fieldPath: `values.${name}` });
        setStateRef("errors", unset(stateRef.current.errors, name, true), {
          fieldPath: `errors.${name}`,
        });
        setStateRef(
          "dirtyFields",
          unset(stateRef.current.dirtyFields, name, true),
          {
            fieldPath: `dirtyFields.${name}`,
          }
        );

        delete fieldValidatorsRef.current[name];
        delete prevBuiltInErrorsRef.current[name];
        delete controllersRef.current[name];
      });

      Object.keys(fields).forEach((name) => {
        if (!fieldsRef.current[name] && initialStateRef.current.values[name])
          values = set(
            values,
            name,
            initialStateRef.current.values[name],
            true
          );
      });

      fieldsRef.current = fields;
      setAllNodesOrStateValue(values, true);
    });
    observer.observe(form, { childList: true, subtree: true });

    return () => {
      form.removeEventListener("input", handleChange);
      form.removeEventListener("focusout", handleBlur);
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("reset", handleReset);
      observer.disconnect();
    };
  }, [
    getFields,
    handleFieldChange,
    reset,
    setAllNodesOrStateValue,
    setFieldTouchedMaybeValidate,
    setStateRef,
    stateRef,
    submit,
  ]);

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
    submit,
    controller,
  };
};
