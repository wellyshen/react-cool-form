/* eslint-disable @typescript-eslint/no-use-before-define */

import { useCallback, useEffect, useRef } from "react";

import {
  Config,
  Controller,
  FieldArgs,
  FieldElement,
  FieldRef,
  Fields,
  FieldValidator,
  FieldsValue,
  FormErrors,
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
  ValidateField,
  ValidateForm,
} from "./types";
import { useIsoLayoutEffect, useLatest, useState } from "./hooks";
import {
  arrayToMap,
  deepMerge,
  filterErrors,
  get,
  isAsyncFunction,
  isCheckboxInput,
  isEmptyObject,
  isFieldElement,
  isFileInput,
  isFileList,
  isFunction,
  isInputElement,
  isMultipleSelect,
  isNumberInput,
  isPlainObject,
  isRadioInput,
  isRangeInput,
  isUndefined,
  runWithLowPriority,
  set,
  setTrueValues,
  unset,
  warn,
} from "./utils";

export default <V extends FormValues = FormValues>({
  defaultValues = {} as V,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  builtInValidationMode = "message",
  removeUnmountedField = true,
  ignoreFields = [],
  onReset,
  onSubmit,
  onError,
  debug,
}: Config<V> = {}): Return<V> => {
  const isInitRef = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldsRef = useRef<Fields>({});
  const fieldArgsRef = useRef<FieldArgs>({});
  const controllersRef = useRef<Map>({});
  const ignoreFieldsRef = useRef<Map>(arrayToMap(ignoreFields));
  const changedFieldRef = useRef<string>();
  const formValidatorRef = useLatest(validate);
  const fieldValidatorsRef = useRef<Record<string, FieldValidator<V>>>({});
  const onResetRef = useLatest(onReset || (() => undefined));
  const onSubmitRef = useLatest(onSubmit || (() => undefined));
  const onErrorRef = useLatest(onError || (() => undefined));
  const defaultValuesRef = useRef(defaultValues);
  const initialStateRef = useRef<FormState<V>>({
    values: defaultValuesRef.current,
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
            warn('💡 react-cool-form > field: Missing the "name" attribute.');
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

          if (isCheckboxInput(field) || isRadioInput(field))
            acc[name].options = acc[name].options
              ? [...acc[name].options, cur]
              : [cur];

          return acc;
        }, {}),
    []
  );

  const getFieldNames = useCallback(
    () => Object.keys({ ...fieldsRef.current, ...controllersRef.current }),
    []
  );

  const handleUnset = useCallback(
    (path: string, fieldPath: string, target: any, name: string) => {
      setStateRef(path, unset(target, name, true), { fieldPath });
    },
    [setStateRef]
  );

  const fieldRef = useCallback<FieldRef<V>>(
    (validateOrOptions) => (field) => {
      if (
        !field?.name ||
        controllersRef.current[field.name] ||
        ignoreFieldsRef.current[field.name]
      )
        return;

      if (isFunction(validateOrOptions)) {
        fieldValidatorsRef.current[field.name] = validateOrOptions;
        return;
      }

      const { validate, ...parsers } = validateOrOptions;

      if (validate) fieldValidatorsRef.current[field.name] = validate;
      fieldArgsRef.current[field.name] = parsers;
    },
    []
  );

  const getNodeValue = useCallback(
    (name: string) => {
      const { field, options } = fieldsRef.current[name];
      let value = field.value as any;

      if (isInputElement(field)) {
        if (fieldArgsRef.current[name]?.valueAsNumber) {
          value = field.valueAsNumber;
          return value;
        }
        if (fieldArgsRef.current[name]?.valueAsDate) {
          value = field.valueAsDate;
          return value;
        }
      }

      if (isNumberInput(field) || isRangeInput(field))
        value = field.valueAsNumber || "";

      if (isCheckboxInput(field)) {
        if (options) {
          const checkboxes = options as HTMLInputElement[];

          if (options.length > 1) {
            value = checkboxes
              .filter((checkbox) => checkbox.checked)
              .map((checkbox) => checkbox.value);
          } else {
            value = checkboxes[0].checked;
          }
        } else {
          let checkValues = get(stateRef.current.values, field.name);

          if (Array.isArray(checkValues)) {
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

      if (isRadioInput(field) && options)
        value =
          (options as HTMLInputElement[]).find((radio) => radio.checked)
            ?.value || "";

      if (isMultipleSelect(field) && !options)
        value = Array.from(field.options)
          .filter((option) => option.selected)
          .map((option) => option.value);

      if (isFileInput(field)) value = field.files;

      return value;
    },
    [stateRef]
  );

  const setNodeValue = useCallback((name: string, value: any) => {
    if (!fieldsRef.current[name] || controllersRef.current[name]) return;

    const { field, options } = fieldsRef.current[name];

    if (isCheckboxInput(field)) {
      const checkboxes = options as HTMLInputElement[];

      if (checkboxes.length > 1) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = Array.isArray(value)
            ? value.includes(checkbox.value)
            : !!value;
        });
      } else {
        checkboxes[0].checked = !!value;
      }
    } else if (isRadioInput(field)) {
      (options as HTMLInputElement[]).forEach((radio) => {
        radio.checked = radio.value === value;
      });
    } else if (isMultipleSelect(field) && Array.isArray(value)) {
      Array.from(field.options).forEach((option) => {
        option.selected = !!value.includes(option.value);
      });
    } else if (isFileInput(field)) {
      if (isFileList(value)) field.files = value;
      if (!value) field.value = "";
    } else {
      field.value = value ?? "";
    }
  }, []);

  const setDefaultValue = useCallback(
    (name: string, value: any) => {
      if (!isUndefined(get(initialStateRef.current.values, name))) return;

      initialStateRef.current.values = set(
        initialStateRef.current.values,
        name,
        value,
        true
      );

      setStateRef(`values.${name}`, get(initialStateRef.current.values, name), {
        shouldUpdate: !isInitRef.current,
      });
    },
    [setStateRef]
  );

  const setNodesOrStateValue = useCallback(
    (
      values: V,
      checkDefaultValues = false,
      fields: FieldsValue[] | string[] = Object.values(fieldsRef.current)
    ) =>
      fields.forEach((field: FieldsValue | string) => {
        const name = isPlainObject(field)
          ? (field as FieldsValue).field.name
          : field;

        if (controllersRef.current[name]) return;

        const value = get(values, name);

        if (!isUndefined(value)) setNodeValue(name, value);

        if (checkDefaultValues) {
          const defaultValue = get(defaultValuesRef.current, name);

          setDefaultValue(
            name,
            !isUndefined(defaultValue) ? defaultValue : getNodeValue(name)
          );
        }
      }),
    [getNodeValue, setDefaultValue, setNodeValue]
  );

  const getState = useCallback<GetState>(
    (path, { target, watch = true, filterUntouchedError = true } = {}) => {
      if (!path) return undefined;

      const getPath = (path: string) => {
        if (path === "values" && !target && watch)
          warn(
            '💡 react-cool-form > getState: Get the "values" alone may cause unnecessary re-renders. If you know what you\'re doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices'
          );

        path = target ? `${target}.${path}` : path;

        if (watch) setUsedStateRef(path);

        return path;
      };
      const errorsEnhancer = (path: string, state: any) => {
        if (
          !watch ||
          !filterUntouchedError ||
          !path.startsWith("errors") ||
          !state ||
          isEmptyObject(state)
        )
          return state;

        path = path.replace("errors", "touched");
        setUsedStateRef(path);

        return filterErrors(state, get(stateRef.current, path));
      };
      let state;

      if (Array.isArray(path)) {
        state = path.map((path) => {
          path = getPath(path);
          return errorsEnhancer(path, get(stateRef.current, path));
        });
      } else if (isPlainObject(path)) {
        const paths = path as Record<string, string>;
        state = Object.keys(paths).reduce((state: Record<string, any>, key) => {
          path = getPath(paths[key]);
          state[key] = errorsEnhancer(path, get(stateRef.current, path));
          return state;
        }, {});
      } else {
        path = getPath(path);
        state = errorsEnhancer(path, get(stateRef.current, path));
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

      if (error) {
        setStateRef(`errors.${name}`, error);
      } else {
        handleUnset("errors", `errors.${name}`, stateRef.current.errors, name);
      }
    },
    [handleUnset, setStateRef, stateRef]
  );

  const runBuiltInValidation = useCallback(
    (name: string) => {
      if (builtInValidationMode === false || !fieldsRef.current[name])
        return undefined;

      const { field } = fieldsRef.current[name];

      if (builtInValidationMode === "message") return field.validationMessage;

      // @ts-expect-error
      // eslint-disable-next-line no-restricted-syntax
      for (const k in field.validity) if (field.validity[k]) return k;

      return undefined;
    },
    [builtInValidationMode]
  );

  const runAllBuiltInValidation = useCallback(() => {
    if (builtInValidationMode === false) return {};

    return Object.keys(fieldsRef.current).reduce((errors, name) => {
      const error = runBuiltInValidation(name);
      errors = { ...errors, ...(error ? set({}, name, error) : {}) };
      return errors;
    }, {});
  }, [builtInValidationMode, runBuiltInValidation]);

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

  const runAllFieldsValidation = useCallback((): Promise<FormErrors<V>> => {
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

  const validateField = useCallback<ValidateField>(
    async (name) => {
      const hasAsyncValidation =
        isAsyncFunction(formValidatorRef.current) ||
        isAsyncFunction(fieldValidatorsRef.current[name]);

      if (hasAsyncValidation) setStateRef("isValidating", true);

      try {
        const error =
          (await runFormValidation(name)) ||
          (await runFieldValidation(name)) ||
          runBuiltInValidation(name);

        setFieldError(name, error);
        if (hasAsyncValidation) setStateRef("isValidating", false);

        return error;
      } catch (exception) {
        return exception;
      }
    },
    [
      formValidatorRef,
      runBuiltInValidation,
      runFieldValidation,
      runFormValidation,
      setFieldError,
      setStateRef,
    ]
  );

  const validateFieldWithLowPriority = useCallback<ValidateField>(
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
      if (
        get(stateRef.current.values, name) !==
        get(initialStateRef.current.values, name)
      ) {
        setStateRef(`dirtyFields.${name}`, true);
      } else {
        handleUnset(
          "dirtyFields",
          `dirtyFields.${name}`,
          stateRef.current.dirtyFields,
          name
        );
      }
    },
    [handleUnset, setStateRef, stateRef]
  );

  const setFieldTouched = useCallback(
    (name: string, shouldValidate = validateOnBlur) => {
      setStateRef(`touched.${name}`, true);

      if (shouldValidate) validateFieldWithLowPriority(name);
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
      setNodesOrStateValue(values);

      if (touchedFields.length)
        setStateRef(
          "touched",
          setTrueValues(
            stateRef.current.touched,
            isFunction(touchedFields)
              ? touchedFields(getFieldNames())
              : touchedFields
          )
        );
      if (dirtyFields.length)
        setStateRef(
          "dirtyFields",
          setTrueValues(
            stateRef.current.dirtyFields,
            isFunction(dirtyFields) ? dirtyFields(getFieldNames()) : dirtyFields
          )
        );
      if (shouldValidate) validateFormWithLowPriority();
    },
    [
      getFieldNames,
      setNodesOrStateValue,
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

      if (!isUndefined(value)) {
        setStateRef(`values.${name}`, value);
      } else {
        handleUnset("values", `values.${name}`, stateRef.current.values, name);
      }
      setNodeValue(name, value);

      if (shouldTouched) setFieldTouched(name, false);
      if (shouldDirty) setFieldDirty(name);
      if (shouldValidate) validateFieldWithLowPriority(name);
    },
    [
      handleUnset,
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
      formState: stateRef.current,
      setErrors,
      setFieldError,
      setValues,
      setFieldValue,
      validateForm,
      validateField,
      reset,
      submit,
    }),
    [
      // @ts-expect-error
      reset,
      setErrors,
      setFieldError,
      setFieldValue,
      setValues,
      stateRef,
      // @ts-expect-error
      submit,
      validateField,
      validateForm,
    ]
  );

  const reset: Reset<V> = useCallback(
    (values, exclude, e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const state = { ...stateRef.current };
      const skip = arrayToMap(exclude || []);

      Object.keys(state).forEach((key) => {
        if (skip[key]) return;

        if (key === "values") {
          const nextValues =
            (isFunction(values) ? values(stateRef.current.values) : values) ||
            initialStateRef.current.values;

          state[key] = nextValues;
          initialStateRef.current.values = nextValues;
          setNodesOrStateValue(initialStateRef.current.values, !!values);
        } else {
          // @ts-expect-error
          state[key] = initialStateRef.current[key];
        }
      });

      setStateRef("", state);
      onResetRef.current(state.values, getOptions(), e);
    },
    [getOptions, onResetRef, setNodesOrStateValue, setStateRef, stateRef]
  );

  const submit: Submit<V> = useCallback(
    async (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const { touched, values } = stateRef.current;

      setStateRef("touched", setTrueValues(touched, getFieldNames()));
      setStateRef("isSubmitting", true);

      try {
        const errors = await validateForm();

        if (!isEmptyObject(errors)) {
          onErrorRef.current(errors, getOptions(), e);

          return { errors };
        }

        await onSubmitRef.current(values, getOptions(), e);
        setStateRef("isSubmitted", true);

        return { values };
      } catch (exception) {
        warn(`💡 react-cool-form > submit: `, exception);
        throw exception;
      } finally {
        setStateRef("isSubmitting", false);
      }
    },
    [
      getFieldNames,
      getOptions,
      onErrorRef,
      onSubmitRef,
      setStateRef,
      stateRef,
      validateForm,
    ]
  );

  const handleChangeEvent = useCallback(
    (name: string, value: any) => {
      setStateRef(`values.${name}`, value);
      setFieldDirty(name);

      if (validateOnChange) validateFieldWithLowPriority(name);
    },
    [setFieldDirty, setStateRef, validateFieldWithLowPriority, validateOnChange]
  );

  const controller = useCallback<Controller<V>>(
    (
      name,
      { validate, value, defaultValue, parse, format, onChange, onBlur } = {}
    ) => {
      if (!name) {
        warn('💡 react-cool-form > controller: Missing the "name" parameter.');
        return undefined;
      }

      controllersRef.current[name] = true;
      if (validate) fieldValidatorsRef.current[name] = validate;

      const val = get(defaultValuesRef.current, name);
      defaultValue = !isUndefined(val) ? val : defaultValue;
      if (!isUndefined(defaultValue)) setDefaultValue(name, defaultValue);

      value = !isUndefined(value) ? value : getState(`values.${name}`);
      value = (format ? format(value) : value) ?? "";

      return {
        name,
        value,
        onChange: (e) => {
          const value =
            e.nativeEvent instanceof Event && isFieldElement(e.target)
              ? getNodeValue(name)
              : e;

          handleChangeEvent(name, parse ? parse(value) : value);
          if (onChange) onChange(e, value);
          changedFieldRef.current = name;
        },
        onBlur: (e) => {
          setFieldTouchedMaybeValidate(name);
          if (onBlur) onBlur(e);
          changedFieldRef.current = undefined;
        },
      };
    },
    [
      getNodeValue,
      getState,
      handleChangeEvent,
      setDefaultValue,
      setFieldTouchedMaybeValidate,
    ]
  );

  useIsoLayoutEffect(() => {
    if (!formRef.current) return;

    fieldsRef.current = getFields(formRef.current);
    setNodesOrStateValue(initialStateRef.current.values, true);
    isInitRef.current = false;
  }, [getFields, setNodesOrStateValue]);

  useEffect(() => {
    if (!formRef.current) return () => null;

    const handleChange = ({ target }: Event) => {
      const { name } = target as FieldElement;

      if (!name) {
        warn('💡 react-cool-form > field: Missing the "name" attribute.');
        return;
      }

      if (fieldsRef.current[name] && !controllersRef.current[name]) {
        const parse = fieldArgsRef.current[name]?.parse;
        const value = getNodeValue(name);

        handleChangeEvent(name, parse ? parse(value) : value);
        changedFieldRef.current = name;
      }
    };

    const handleBlur = ({ target }: Event) => {
      if (!isFieldElement(target as HTMLElement)) return;

      const { name } = target as FieldElement;

      if (fieldsRef.current[name] && !controllersRef.current[name]) {
        setFieldTouchedMaybeValidate(name);
        changedFieldRef.current = undefined;
      }
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

      if (removeUnmountedField)
        Object.keys(fieldsRef.current).forEach((name) => {
          if (fields[name]) return;

          handleUnset(
            "values",
            `values.${name}`,
            stateRef.current.values,
            name
          );
          handleUnset(
            "touched",
            `touched.${name}`,
            stateRef.current.touched,
            name
          );
          handleUnset(
            "dirtyFields",
            `dirtyFields.${name}`,
            stateRef.current.dirtyFields,
            name
          );
          handleUnset(
            "errors",
            `errors.${name}`,
            stateRef.current.errors,
            name
          );

          initialStateRef.current.values = unset(
            initialStateRef.current.values,
            name,
            true
          );

          delete fieldArgsRef.current[name];
          delete fieldValidatorsRef.current[name];
          delete controllersRef.current[name];
        });

      const addedNodes: string[] = [];

      Object.keys(fields).forEach((name) => {
        if (fieldsRef.current[name] || controllersRef.current[name]) return;

        const defaultValue = get(defaultValuesRef.current, name);

        if (!isUndefined(defaultValue))
          values = set(values, name, defaultValue, true);

        addedNodes.push(name);
      });

      fieldsRef.current = fields;
      if (addedNodes.length) setNodesOrStateValue(values, true, addedNodes);
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
    getNodeValue,
    handleChangeEvent,
    handleUnset,
    removeUnmountedField,
    reset,
    setFieldTouchedMaybeValidate,
    setNodesOrStateValue,
    stateRef,
    submit,
  ]);

  return {
    form: formRef,
    field: fieldRef,
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
