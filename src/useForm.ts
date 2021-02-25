/* eslint-disable @typescript-eslint/no-use-before-define */

import { useCallback, useEffect, useRef } from "react";
import { dequal } from "dequal/lite";

import * as shared from "./shared";
import {
  ClearErrors,
  Controller,
  Field,
  FieldElement,
  Fields,
  FieldValidator,
  FormConfig,
  FormErrors,
  FormReturn,
  FormState,
  FormValues,
  GetFormState,
  GetState,
  Handlers,
  Map,
  Parsers,
  RegisterField,
  RegisterForm,
  Reset,
  RunValidation,
  Select,
  SetDirty,
  SetError,
  SetTouched,
  SetValue,
  Submit,
} from "./types";
import { useLatest, useState } from "./hooks";
import {
  arrayToMap,
  compact,
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
  unset,
  warn,
} from "./utils";

export default <V extends FormValues = FormValues>({
  id,
  defaultValues = {} as V,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  builtInValidationMode = "message",
  shouldRemoveField = true,
  excludeFields = [],
  onReset,
  onSubmit,
  onError,
  debug,
}: FormConfig<V> = {}): FormReturn<V> => {
  const isInitRef = useRef(true);
  const handlersRef = useRef<Handlers>({});
  const observerRef = useRef<MutationObserver>();
  const formRef = useRef<HTMLElement>();
  const fieldsRef = useRef<Fields>({});
  const fieldParsersRef = useRef<Parsers>({});
  const controllersRef = useRef<Map>({});
  const excludeFieldsRef = useRef<Map>(arrayToMap(excludeFields));
  const changedFieldRef = useRef<string>();
  const formValidatorRef = useLatest(validate);
  const fieldValidatorsRef = useRef<Map<FieldValidator<V>>>({});
  const onResetRef = useLatest(onReset || (() => undefined));
  const onSubmitRef = useLatest(onSubmit || (() => undefined));
  const onErrorRef = useLatest(onError || (() => undefined));
  const defaultValuesRef = useRef(defaultValues);
  const initialStateRef = useRef<FormState<V>>({
    values: defaultValuesRef.current,
    touched: {},
    errors: {},
    isDirty: false,
    dirty: {},
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  });
  const {
    stateRef,
    setStateRef,
    setUsedState,
    subscribeObserver,
    unsubscribeObserver,
  } = useState<V>(initialStateRef.current, debug);

  const handleUnset = useCallback(
    (path: string, fieldPath: string, target: any, name: string) =>
      setStateRef(path, unset(target, name, true), { fieldPath }),
    [setStateRef]
  );

  const getFields = useCallback(
    (form: HTMLElement) =>
      Array.from(form.querySelectorAll("input,textarea,select"))
        .filter((element) => {
          const field = element as FieldElement;
          const {
            type,
            name,
            dataset: { rcfExclude },
          } = field;

          if (/button|image|submit|reset/.test(type)) return false;
          if (rcfExclude !== "true" && !name) {
            warn('💡 react-cool-form > field: Missing the "name" attribute.');
            return false;
          }

          return (
            controllersRef.current[name] ||
            (rcfExclude !== "true" && !excludeFieldsRef.current[name])
          );
        })
        .reduce((acc: Map<any>, cur) => {
          const field = cur as FieldElement;
          const { name } = field;

          acc[name] = { ...acc[name], field: acc[name]?.field || cur };

          if (isCheckboxInput(field) || isRadioInput(field))
            acc[name].options = acc[name].options
              ? [...acc[name].options, cur]
              : [cur];

          return acc;
        }, {}),
    []
  );

  const getNodeValue = useCallback((name: string) => {
    const { field, options } = fieldsRef.current[name];
    let value = field.value as any;

    if (isInputElement(field)) {
      if (fieldParsersRef.current[name]?.valueAsNumber) {
        value = field.valueAsNumber;
        return value;
      }
      if (fieldParsersRef.current[name]?.valueAsDate) {
        value = field.valueAsDate;
        return value;
      }
    }

    if (isNumberInput(field) || isRangeInput(field))
      value = field.valueAsNumber || "";

    if (isCheckboxInput(field)) {
      const checkboxes = options as HTMLInputElement[];

      value =
        checkboxes.length > 1
          ? checkboxes
              .filter((checkbox) => checkbox.checked)
              .map((checkbox) => checkbox.value)
          : checkboxes[0].checked;
    }

    if (isRadioInput(field))
      value =
        (options as HTMLInputElement[]).find((radio) => radio.checked)?.value ||
        "";

    if (isMultipleSelect(field))
      value = Array.from(field.options)
        .filter((option) => option.selected)
        .map((option) => option.value);

    if (isFileInput(field)) value = field.files;

    return value;
  }, []);

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

      initialStateRef.current = set(
        initialStateRef.current,
        `values.${name}`,
        value,
        true
      );

      setStateRef(`values.${name}`, value, {
        shouldUpdate: !isInitRef.current,
      });
    },
    [setStateRef]
  );

  const setNodesOrStateValue = useCallback(
    (
      values: V,
      checkDefaultValues,
      fields: Field[] | string[] = Object.values(fieldsRef.current)
    ) =>
      fields.forEach((field: Field | string) => {
        const name = isPlainObject(field) ? (field as Field).field.name : field;

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

  const getFormState = useCallback<GetFormState>(
    (path, { target, errorWithTouched, methodName = "select", callback }) => {
      if (!path) return callback ? undefined : stateRef.current;

      const usedState: Map = {};
      const getPath = (p: string) => {
        p = target ? `${target}.${p}` : p;

        if (callback) {
          if (p === "values")
            warn(
              `💡 react-cool-form > ${methodName}: Getting the "values" alone may cause unnecessary re-renders. If you know what you're doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices`
            );

          usedState[p] = true;
        }

        return p;
      };
      const errorsEnhancer = (p: string, state: any) => {
        if (
          !errorWithTouched ||
          !p.startsWith("errors") ||
          !state ||
          isEmptyObject(state)
        )
          return state;

        p = p.replace("errors", "touched");
        usedState[p] = true;

        return filterErrors(state, get(stateRef.current, p));
      };
      let state;

      if (Array.isArray(path)) {
        state = path.map((p) => {
          p = getPath(p);
          return errorsEnhancer(p, get(stateRef.current, p));
        });
      } else if (isPlainObject(path)) {
        const paths = path as Map<string>;
        state = Object.keys(paths).reduce((s: Map<any>, key) => {
          path = getPath(paths[key]);
          s[key] = errorsEnhancer(path, get(stateRef.current, path));
          return s;
        }, {});
      } else {
        path = getPath(path);
        state = errorsEnhancer(path, get(stateRef.current, path));
      }

      if (callback) callback(usedState);

      return state;
    },
    [stateRef]
  );

  const select = useCallback<Select>(
    (path, { target, errorWithTouched } = {}) =>
      getFormState(path, {
        target,
        errorWithTouched,
        callback: (usedState) => setUsedState(usedState),
      }),
    [getFormState, setUsedState]
  );

  const getState = useCallback<GetState>(
    (path, target) => getFormState(path, { target }),
    [getFormState]
  );

  const setError = useCallback<SetError>(
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

  const clearErrors = useCallback<ClearErrors>(
    (name) => {
      if (!name) {
        setStateRef("errors", {});
      } else if (Array.isArray(name)) {
        name.forEach((n) =>
          handleUnset("errors", `errors.${n}`, stateRef.current.errors, n)
        );
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

      for (const k in field.validity) // @ts-expect-error
        if (k !== "valid" && field.validity[k]) return k;

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
        warn(`💡 react-cool-form > validate form: `, exception);
        throw exception;
      }
    },
    [formValidatorRef, stateRef]
  );

  const validateField = useCallback(
    async (name: string) => {
      const hasAsyncValidator =
        isAsyncFunction(formValidatorRef.current) ||
        isAsyncFunction(fieldValidatorsRef.current[name]);

      if (hasAsyncValidator) setStateRef("isValidating", true);

      try {
        const error =
          (await runFormValidation(name)) ||
          (await runFieldValidation(name)) ||
          runBuiltInValidation(name);

        setError(name, error);
        if (hasAsyncValidator) setStateRef("isValidating", false);

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
      setError,
      setStateRef,
    ]
  );

  const validateFieldWithLowPriority = useCallback<typeof validateField>(
    (name) => runWithLowPriority(() => validateField(name)),
    [validateField]
  );

  const validateForm = useCallback((): Promise<FormErrors<V>> => {
    setStateRef("isValidating", true);

    return Promise.all([
      runAllBuiltInValidation(),
      runAllFieldsValidation(),
      runFormValidation(),
    ]).then((errors) => {
      const errs = deepMerge(...errors);

      setStateRef("errors", errs);
      setStateRef("isValidating", false);

      return errs;
    });
  }, [
    runAllBuiltInValidation,
    runAllFieldsValidation,
    runFormValidation,
    setStateRef,
  ]);

  const runValidation = useCallback<RunValidation>(
    (name) => {
      if (!name) return validateForm().then((errors) => isEmptyObject(errors));

      if (Array.isArray(name))
        return Promise.all(name.map((n) => validateField(n))).then(
          (errors) => !compact(errors).length
        );

      return validateField(name).then((error) => !error);
    },
    [validateField, validateForm]
  );

  const setTouched = useCallback<SetTouched>(
    (name, isTouched = true, shouldValidate = validateOnBlur) => {
      if (isTouched) {
        setStateRef(`touched.${name}`, true);
      } else {
        handleUnset(
          "touched",
          `touched.${name}`,
          stateRef.current.touched,
          name
        );
      }

      if (shouldValidate) validateFieldWithLowPriority(name);
    },
    [
      handleUnset,
      setStateRef,
      stateRef,
      validateFieldWithLowPriority,
      validateOnBlur,
    ]
  );

  const setTouchedMaybeValidate = useCallback(
    (name: string) =>
      setTouched(
        name,
        true,
        validateOnChange ? name !== changedFieldRef.current : undefined
      ),
    [setTouched, validateOnChange]
  );

  const setDirty = useCallback<SetDirty>(
    (name, isDirty = true) => {
      if (isDirty) {
        setStateRef(`dirty.${name}`, true);
      } else {
        handleUnset("dirty", `dirty.${name}`, stateRef.current.dirty, name);
      }
    },
    [handleUnset, setStateRef, stateRef]
  );

  const setDirtyIfNeeded = useCallback(
    (name: string) =>
      setDirty(
        name,
        !dequal(
          get(stateRef.current.values, name),
          get(initialStateRef.current.values, name)
        )
      ),
    [setDirty, stateRef]
  );

  const setValue = useCallback<SetValue>(
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

      if (shouldTouched) setTouched(name, true, false);
      if (shouldDirty) setDirtyIfNeeded(name);
      if (shouldValidate) validateFieldWithLowPriority(name);
    },
    [
      handleUnset,
      setDirtyIfNeeded,
      setNodeValue,
      setStateRef,
      setTouched,
      stateRef,
      validateFieldWithLowPriority,
      validateOnChange,
    ]
  );

  const getOptions = useCallback(
    () => ({
      getState,
      setValue,
      setTouched,
      setDirty,
      setError,
      clearErrors,
      runValidation,
      reset,
      submit,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reset: Reset<V> = useCallback(
    (values, exclude, e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      const state = { ...stateRef.current };
      const skip = arrayToMap(exclude || []);

      Object.keys(state).forEach((key) => {
        if (skip[key]) return;

        if (key === "values") {
          const nextValues =
            (isFunction(values) ? values(stateRef.current.values) : values) ||
            initialStateRef.current.values;

          state[key] = nextValues;
          initialStateRef.current = set(
            initialStateRef.current,
            "values",
            nextValues,
            true
          );
          setNodesOrStateValue(nextValues, !!values);
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
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      const nextTouched = Object.keys({
        ...fieldsRef.current,
        ...controllersRef.current,
      }).reduce((touched, name) => {
        touched = set(touched, name, true, true);
        return touched;
      }, stateRef.current.touched);

      setStateRef("touched", nextTouched);
      setStateRef("isSubmitting", true);

      try {
        const errors = await validateForm();

        if (!isEmptyObject(errors)) {
          onErrorRef.current(errors, getOptions(), e);

          return { errors };
        }

        await onSubmitRef.current(stateRef.current.values, getOptions(), e);
        setStateRef("isSubmitted", true);

        return { values: stateRef.current.values };
      } catch (exception) {
        warn(`💡 react-cool-form > submit: `, exception);
        throw exception;
      } finally {
        setStateRef("isSubmitting", false);
      }
    },
    [getOptions, onErrorRef, onSubmitRef, setStateRef, stateRef, validateForm]
  );

  const handleChangeEvent = useCallback(
    (name: string, value: any) => {
      setStateRef(`values.${name}`, value);
      setDirtyIfNeeded(name);

      if (validateOnChange) validateFieldWithLowPriority(name);
    },
    [
      setDirtyIfNeeded,
      setStateRef,
      validateFieldWithLowPriority,
      validateOnChange,
    ]
  );

  const controller = useCallback<Controller<V>>(
    (
      name,
      {
        validate: validator,
        value,
        defaultValue,
        parse,
        format,
        onChange,
        onBlur,
      } = {}
    ) => {
      if (!name) {
        warn('💡 react-cool-form > controller: Missing the "name" parameter.');
        return undefined;
      }

      controllersRef.current[name] = true;
      if (validator) fieldValidatorsRef.current[name] = validator;

      const val = get(defaultValuesRef.current, name);
      defaultValue = !isUndefined(val) ? val : defaultValue;
      if (!isUndefined(defaultValue)) setDefaultValue(name, defaultValue);

      value = !isUndefined(value) ? value : select(`values.${name}`);
      value = (format ? format(value) : value) ?? "";

      return {
        name,
        value,
        onChange: (...args) => {
          let v;

          if (parse) {
            v = parse(...args);
          } else {
            const e = args[0];
            v =
              e?.nativeEvent instanceof Event && isFieldElement(e.target)
                ? getNodeValue(name)
                : e;
          }

          handleChangeEvent(name, v);
          if (onChange) onChange(...args, v);
          changedFieldRef.current = name;
        },
        onBlur: (e) => {
          setTouchedMaybeValidate(name);
          if (onBlur) onBlur(e);
          changedFieldRef.current = undefined;
        },
      };
    },
    [
      getNodeValue,
      handleChangeEvent,
      setDefaultValue,
      setTouchedMaybeValidate,
      select,
    ]
  );

  const registerForm = useCallback<RegisterForm>(
    (el) => {
      if (!el) return;

      formRef.current = el;
      const form = formRef.current;

      fieldsRef.current = getFields(form);
      setNodesOrStateValue(initialStateRef.current.values, true);
      isInitRef.current = false;

      handlersRef.current.change = ({ target }: Event) => {
        const { name } = target as FieldElement;

        if (!name) {
          warn('💡 react-cool-form > field: Missing the "name" attribute.');
          return;
        }

        if (fieldsRef.current[name] && !controllersRef.current[name]) {
          const parse = fieldParsersRef.current[name]?.parse;
          const value = getNodeValue(name);

          handleChangeEvent(name, parse ? parse(value) : value);
          changedFieldRef.current = name;
        }
      };

      handlersRef.current.blur = ({ target }: Event) => {
        if (!isFieldElement(target as HTMLElement)) return;

        const { name } = target as FieldElement;

        if (fieldsRef.current[name] && !controllersRef.current[name]) {
          setTouchedMaybeValidate(name);
          changedFieldRef.current = undefined;
        }
      };

      handlersRef.current.submit = (e: Event) => submit(e as any);

      handlersRef.current.reset = (e: Event) => reset(null, null, e as any);

      form.addEventListener("input", handlersRef.current.change);
      form.addEventListener("focusout", handlersRef.current.blur);
      form.addEventListener("submit", handlersRef.current.submit);
      form.addEventListener("reset", handlersRef.current.reset);

      observerRef.current = new MutationObserver(([{ type }]) => {
        if (type !== "childList") return;

        const fields = getFields(form);
        let { values } = stateRef.current;

        if (shouldRemoveField)
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
            handleUnset("dirty", `dirty.${name}`, stateRef.current.dirty, name);
            handleUnset(
              "errors",
              `errors.${name}`,
              stateRef.current.errors,
              name
            );

            initialStateRef.current = unset(
              initialStateRef.current,
              `values.${name}`,
              true
            );

            delete fieldParsersRef.current[name];
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

      observerRef.current.observe(form, { childList: true, subtree: true });
    },
    [
      getFields,
      getNodeValue,
      handleChangeEvent,
      handleUnset,
      reset,
      setNodesOrStateValue,
      setTouchedMaybeValidate,
      shouldRemoveField,
      stateRef,
      submit,
    ]
  );

  const registerField = useCallback<RegisterField<V>>(
    (validateOrOptions) => (field) => {
      if (
        !field?.name ||
        controllersRef.current[field.name] ||
        excludeFieldsRef.current[field.name]
      )
        return;

      if (isFunction(validateOrOptions)) {
        fieldValidatorsRef.current[field.name] = validateOrOptions;
        return;
      }

      const { validate: validator, ...parsers } = validateOrOptions;

      if (validator) fieldValidatorsRef.current[field.name] = validator;
      fieldParsersRef.current[field.name] = parsers;
    },
    []
  );

  if (id)
    shared.set(id, {
      getFormState,
      subscribeObserver,
      unsubscribeObserver,
    });

  useEffect(
    () => () => {
      if (formRef.current) {
        const handlers = handlersRef.current as Required<Handlers>;

        formRef.current.removeEventListener("input", handlers.change);
        formRef.current.removeEventListener("focusout", handlers.blur);
        formRef.current.removeEventListener("submit", handlers.submit);
        formRef.current.removeEventListener("reset", handlers.reset);
        observerRef.current?.disconnect();
      }

      if (id) shared.remove(id);
    },
    [id]
  );

  return {
    form: registerForm,
    field: registerField,
    select,
    getState,
    setValue,
    setTouched,
    setDirty,
    setError,
    clearErrors,
    runValidation,
    reset,
    submit,
    controller,
  };
};
