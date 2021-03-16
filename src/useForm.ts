/* eslint-disable @typescript-eslint/no-use-before-define */

import { useCallback, useEffect, useRef } from "react";
import { dequal } from "dequal/lite";

import * as shared from "./shared";
import {
  ClearErrors,
  Field,
  FieldArray,
  FieldElement,
  Fields,
  FieldValidator,
  FormConfig,
  FormErrors,
  FormMethods,
  FormState,
  FormValues,
  GetFormState,
  GetNodeValue,
  GetState,
  HandleChangeEvent,
  Handlers,
  Map,
  Parsers,
  RegisterField,
  RegisterForm,
  RemoveField,
  Reset,
  RunValidation,
  Select,
  SetDefaultValue,
  SetDirty,
  SetError,
  SetTouched,
  SetTouchedMaybeValidate,
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
  isFieldArray,
  isFieldElement,
  isFileInput,
  isFileList,
  isFunction,
  isInputElement,
  isNumberInput,
  isPlainObject,
  isRadioInput,
  isRangeInput,
  isSelectMultiple,
  isSelectOne,
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
}: FormConfig<V> = {}): FormMethods<V> => {
  const handlersRef = useRef<Handlers>({});
  const observerRef = useRef<MutationObserver>();
  const formRef = useRef<HTMLElement>();
  const fieldsRef = useRef<Fields>({});
  const fieldParsersRef = useRef<Parsers>({});
  const fieldArrayRef = useRef<FieldArray>({});
  const controlledsRef = useRef<Map>({});
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
    (path: string) => {
      const [t, n] = path.split(".");
      setStateRef(
        t,
        unset(stateRef.current[t as keyof FormState<V>], n, true),
        {
          fieldPath: path,
        }
      );
    },
    [setStateRef, stateRef]
  );

  const getFields = useCallback(
    (form: HTMLElement) =>
      Array.from(form.querySelectorAll("input,textarea,select"))
        .filter((element) => {
          const field = element as FieldElement;
          const {
            type,
            name,
            id: fieldId,
            classList,
            dataset: { rcfExclude },
          } = field;

          const classes = Array.from(classList);
          const { current: exclude } = excludeFieldsRef;

          if (
            /button|image|submit|reset/.test(type) ||
            (fieldId && exclude[`#${fieldId}`]) ||
            classes.find((n) => exclude[`.${n}`])
          )
            return false;

          if (rcfExclude !== "true" && !name) {
            warn(
              '💡 react-cool-form > field: Missing "name" attribute. Do you want to exclude the field? See: https://react-cool-form.netlify.app/docs/api-reference/use-form/#excludefields'
            );
            return false;
          }

          return (
            controlledsRef.current[name] ||
            (rcfExclude !== "true" && !exclude[name])
          );
        })
        .reduce((acc: Fields, elm) => {
          const field = elm as FieldElement;
          const { name } = field;

          acc[name] = { ...acc[name], field: acc[name]?.field || field };

          if (isCheckboxInput(field) || isRadioInput(field)) {
            acc[name].options = acc[name].options
              ? [...(acc[name].options as HTMLInputElement[]), field]
              : [field];
          } else if (isSelectOne(field) || isSelectMultiple(field)) {
            acc[name].options = Array.from(field.options);
          }

          return acc;
        }, {}),
    []
  );

  const getNodeValue = useCallback<GetNodeValue>(
    (name, fields = fieldsRef.current) => {
      const { field, options } = fields[name];
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
        const checkbox = checkboxes[0];

        if (checkboxes.length > 1) {
          value = checkboxes.filter((c) => c.checked).map((c) => c.value);
        } else if (checkbox.hasAttribute("value") && checkbox.value) {
          value = checkbox.checked ? [checkbox.value] : [];
        } else {
          value = checkbox.checked;
        }
      }

      if (isRadioInput(field))
        value =
          (options as HTMLInputElement[]).find((radio) => radio.checked)
            ?.value || "";

      if (isSelectMultiple(field))
        value = (options as HTMLOptionElement[])
          .filter((option) => option.selected)
          .map((option) => option.value);

      if (isFileInput(field)) value = field.files;

      return value;
    },
    []
  );

  const setNodeValue = useCallback(
    (name: string, value: any, fields: Fields = fieldsRef.current) => {
      if (!fields[name] || controlledsRef.current[name]) return;

      const { field, options } = fields[name];

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
      } else if (isSelectMultiple(field) && Array.isArray(value)) {
        (options as HTMLOptionElement[]).forEach((option) => {
          option.selected = !!value.includes(option.value);
        });
      } else if (isFileInput(field)) {
        if (isFileList(value)) field.files = value;
        if (!value) field.value = "";
      } else {
        field.value = value ?? "";
      }
    },
    []
  );

  const setDefaultValue = useCallback<SetDefaultValue>(
    (name, value) => {
      if (!isFieldArray(fieldArrayRef.current, name))
        initialStateRef.current = set(
          initialStateRef.current,
          `values.${name}`,
          value,
          true
        );

      if (!dequal(get(stateRef.current.values, name), value))
        setStateRef(`values.${name}`, value, { shouldUpdate: false });
    },
    [setStateRef, stateRef]
  );

  const setNodesOrStateValue = useCallback(
    (
      values: V,
      {
        shouldUpdateDefaultValues = true,
        fields = Object.values(fieldsRef.current),
      }: {
        shouldUpdateDefaultValues?: boolean;
        fields?: Field[] | string[];
      } = {}
    ) =>
      fields.forEach((field: Field | string) => {
        const name = isPlainObject(field) ? (field as Field).field.name : field;

        if (controlledsRef.current[name]) return;

        let value = get(values, name);

        if (!isUndefined(value)) setNodeValue(name, value);

        if (shouldUpdateDefaultValues) {
          value = get(defaultValuesRef.current, name);

          setDefaultValue(
            name,
            !isUndefined(value) ? value : getNodeValue(name)
          );
        }
      }),
    [getNodeValue, setDefaultValue, setNodeValue]
  );

  const getFormState = useCallback<GetFormState<V>>(
    (
      path,
      {
        target,
        errorWithTouched,
        defaultValues: dfValues = {},
        methodName = "select",
        callback,
      }
    ) => {
      if (!path) return callback ? undefined : stateRef.current;

      const usedState: Map = {};
      const getPath = (p: string) => {
        p = target ? `${target}.${p}` : p;

        if (callback) {
          if (p === "values")
            warn(
              `💡 react-cool-form > ${methodName}: Getting "values" alone might cause unnecessary re-renders. If you know what you're doing, please ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices`
            );

          usedState[p] = true;
        }

        return p;
      };
      const helper = (p: string, state: any) => {
        if (p.startsWith("values")) {
          if (!isUndefined(state)) return state;

          p = p.replace("values.", "");
          state = get(defaultValuesRef.current, p);

          return !isUndefined(state) ? state : get(dfValues, p);
        }

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
          return helper(p, get(stateRef.current, p));
        });
      } else if (isPlainObject(path)) {
        const paths = path as Map<string>;
        state = Object.keys(paths).reduce((s: Map<any>, key) => {
          path = getPath(paths[key]);
          s[key] = helper(path, get(stateRef.current, path));
          return s;
        }, {});
      } else {
        path = getPath(path);
        state = helper(path, get(stateRef.current, path));
      }

      if (callback) callback(usedState);

      return state;
    },
    [stateRef]
  );

  const select = useCallback<Select<V>>(
    (path, { target, errorWithTouched, defaultValues: dfValues } = {}) =>
      getFormState(path, {
        target,
        errorWithTouched,
        defaultValues: dfValues,
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
        handleUnset(`errors.${name}`);
      }
    },
    [handleUnset, setStateRef, stateRef]
  );

  const clearErrors = useCallback<ClearErrors>(
    (name) => {
      if (!name) {
        setStateRef("errors", {});
      } else if (Array.isArray(name)) {
        name.forEach((n) => setError(n));
      } else {
        setError(name);
      }
    },
    [setError, setStateRef]
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
      const value = get(stateRef.current.values, name);

      if (!fieldValidatorsRef.current[name] || isUndefined(value))
        return undefined;

      try {
        const error = await fieldValidatorsRef.current[name](
          value,
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
        handleUnset(`touched.${name}`);
      }

      if (shouldValidate) validateFieldWithLowPriority(name);
    },
    [handleUnset, setStateRef, validateFieldWithLowPriority, validateOnBlur]
  );

  const setTouchedMaybeValidate = useCallback<SetTouchedMaybeValidate>(
    (name) =>
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
        handleUnset(`dirty.${name}`);
      }
    },
    [handleUnset, setStateRef]
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
        handleUnset(`values.${name}`);
      }
      setNodeValue(name, value);

      if (shouldTouched) setTouched(name, true, false);
      if (shouldDirty) setDirtyIfNeeded(name);
      if (shouldValidate) validateFieldWithLowPriority(name);

      isFieldArray(fieldArrayRef.current, name, (key) => {
        setNodesOrStateValue(initialStateRef.current.values, {
          shouldUpdateDefaultValues: false,
          fields: Object.keys(fieldsRef.current).filter((k) =>
            k.startsWith(key)
          ),
        });
        fieldArrayRef.current[key].reset();
      });
    },
    [
      handleUnset,
      setDirtyIfNeeded,
      setNodeValue,
      setNodesOrStateValue,
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
          setNodesOrStateValue(nextValues, {
            shouldUpdateDefaultValues: false,
          });
        } else {
          // @ts-expect-error
          state[key] = initialStateRef.current[key];
        }
      });

      setStateRef("", state);
      onResetRef.current(state.values, getOptions(), e);

      Object.values(fieldArrayRef.current).forEach((field) => field.reset());
    },
    [getOptions, onResetRef, setNodesOrStateValue, setStateRef, stateRef]
  );

  const submit: Submit<V> = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      const nextTouched = Object.keys({
        ...fieldsRef.current,
        ...controlledsRef.current,
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

  const handleChangeEvent = useCallback<HandleChangeEvent>(
    (name, value) => {
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

  const removeField = useCallback<RemoveField>(
    (name) => {
      const { values, touched, dirty, errors } = stateRef.current;

      if (!isUndefined(get(values, name))) handleUnset(`values.${name}`);
      if (!isUndefined(get(touched, name))) handleUnset(`touched.${name}`);
      if (!isUndefined(get(dirty, name))) handleUnset(`dirty.${name}`);
      if (!isUndefined(get(errors, name))) handleUnset(`errors.${name}`);

      initialStateRef.current = unset(
        initialStateRef.current,
        `values.${name}`,
        true
      );

      delete fieldParsersRef.current[name];
      delete fieldValidatorsRef.current[name];
      delete controlledsRef.current[name];
    },
    [handleUnset, stateRef]
  );

  const registerForm = useCallback<RegisterForm>(
    (el) => {
      if (!el) return;

      formRef.current = el;
      const form = formRef.current;

      fieldsRef.current = getFields(form);
      setNodesOrStateValue(initialStateRef.current.values);

      handlersRef.current.change = ({ target }: Event) => {
        const { name } = target as FieldElement;

        if (!name) {
          warn('💡 react-cool-form > field: Missing "name" attribute.');
          return;
        }

        if (fieldsRef.current[name] && !controlledsRef.current[name]) {
          const parse = fieldParsersRef.current[name]?.parse;
          const value = getNodeValue(name);

          handleChangeEvent(name, parse ? parse(value) : value);
          changedFieldRef.current = name;
        }
      };

      handlersRef.current.blur = ({ target }: Event) => {
        if (!isFieldElement(target as HTMLElement)) return;

        const { name } = target as FieldElement;

        if (fieldsRef.current[name] && !controlledsRef.current[name]) {
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

        if (shouldRemoveField)
          Object.keys(fieldsRef.current).forEach((name) => {
            if (controlledsRef.current[name]) return;

            if (!fields[name]) {
              removeField(name);
              return;
            }

            const currOptions = fieldsRef.current[name].options
              ?.length as number;
            const nextOptions = fields[name].options?.length as number;

            if (currOptions > nextOptions) {
              setStateRef(`values.${name}`, getNodeValue(name, fields), {
                shouldUpdate: false,
              });
            } else if (currOptions < nextOptions) {
              setNodeValue(
                name,
                get(initialStateRef.current.values, name),
                fields
              );
            }
          });

        let values = defaultValuesRef.current;
        const addedNodes: string[] = [];

        Object.keys(fields).forEach((name) => {
          if (fieldsRef.current[name] || controlledsRef.current[name]) return;

          const value = get(stateRef.current.values, name);
          if (!isUndefined(value)) values = set(values, name, value, true);

          addedNodes.push(name);
        });

        fieldsRef.current = fields;
        if (addedNodes.length)
          setNodesOrStateValue(values, { fields: addedNodes });
      });

      observerRef.current.observe(form, { childList: true, subtree: true });
    },
    [
      getFields,
      getNodeValue,
      handleChangeEvent,
      removeField,
      reset,
      setNodeValue,
      setNodesOrStateValue,
      setStateRef,
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
        controlledsRef.current[field.name] ||
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

  shared.set(id, {
    shouldRemoveField,
    defaultValuesRef,
    initialStateRef,
    fieldArrayRef,
    controlledsRef,
    fieldValidatorsRef,
    changedFieldRef,
    excludeFieldsRef,
    setStateRef,
    getNodeValue,
    getFormState,
    setDefaultValue,
    setTouchedMaybeValidate,
    handleChangeEvent,
    removeField,
    subscribeObserver,
    unsubscribeObserver,
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

      shared.remove(id);
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
  };
};
