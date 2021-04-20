/* eslint-disable @typescript-eslint/no-use-before-define */

import { useCallback, useEffect, useRef } from "react";
import { dequal } from "dequal/lite";

import * as shared from "./shared";
import {
  ClearErrors,
  FieldArray,
  FieldElement,
  Fields,
  FieldValidator,
  Focus,
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
  Mon,
  ObjMap,
  Parsers,
  RegisterField,
  RegisterForm,
  RemoveField,
  Reset,
  RunValidation,
  SetDefaultValue,
  SetDirty,
  SetError,
  SetNodesOrValues,
  SetTouched,
  SetTouchedMaybeValidate,
  SetValue,
  ShouldRemoveField,
  Submit,
} from "./types";
import { useLatest, useState } from "./hooks";
import {
  arrayToMap,
  compact,
  deepMerge,
  filterErrors,
  get,
  getPath,
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
  parseState,
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
  focusOnError = true,
  removeOnUnmounted = true,
  builtInValidationMode = "message",
  excludeFields = [],
  onReset,
  onSubmit,
  onError,
  onStateChange,
}: FormConfig<V> = {}): FormMethods<V> => {
  const handlersRef = useRef<Handlers>({});
  const mutationObserverRef = useRef<MutationObserver>();
  const formRef = useRef<HTMLElement>();
  const fieldsRef = useRef<Fields>(new Map());
  const fieldParsersRef = useRef<Parsers>({});
  const fieldArrayRef = useRef<FieldArray>({});
  const controlsRef = useRef<ObjMap>({});
  const formValidatorRef = useLatest(validate);
  const fieldValidatorsRef = useRef<ObjMap<FieldValidator<V>>>({});
  const changedFieldRef = useRef<string>();
  const excludeFieldsRef = useRef<ObjMap>(arrayToMap(excludeFields));
  const onResetRef = useLatest(onReset || (() => undefined));
  const onSubmitRef = useLatest(onSubmit || (() => undefined));
  const onErrorRef = useLatest(onError || (() => undefined));
  const hasWarnValues = useRef(false);
  const initialStateRef = useRef<FormState<V>>({
    values: defaultValues,
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
  const { stateRef, setStateRef, observersRef } = useState<V>(
    initialStateRef.current,
    onStateChange
  );

  const handleUnset = useCallback(
    (
      path: string,
      options?: { shouldSkipUpdate?: boolean; shouldForceUpdate?: boolean }
    ) => {
      const segs = path.split(".");
      const k = segs.shift() as string;
      setStateRef(
        k,
        unset(stateRef.current[k as keyof FormState<V>], segs.join("."), true),
        { fieldPath: path, ...options }
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
          const { current: exclude } = excludeFieldsRef;

          if (
            /button|image|submit|reset/.test(type) ||
            (fieldId && exclude[`#${fieldId}`]) ||
            Array.from(classList).find((n) => exclude[`.${n}`])
          )
            return false;

          if (rcfExclude !== "true" && !name) {
            warn(
              '💡 react-cool-form > field: Missing "name" attribute. Do you want to exclude the field? See: https://react-cool-form.netlify.app/docs/api-reference/use-form/#excludefields'
            );
            return false;
          }

          return (
            controlsRef.current[name] ||
            (rcfExclude !== "true" && !exclude[name])
          );
        })
        .reduce((acc, elm) => {
          const field = elm as FieldElement;
          const { name } = field;
          const fieldArrayName = isFieldArray(fieldArrayRef.current, name);

          if (fieldArrayName)
            fieldArrayRef.current[fieldArrayName].fields[name] = true;

          acc.set(name, {
            ...acc.get(name),
            field: acc.get(name)?.field || field,
          });

          if (isCheckboxInput(field) || isRadioInput(field)) {
            acc.get(name).options = acc.get(name).options
              ? [...acc.get(name).options, field]
              : [field];
          } else if (isSelectOne(field) || isSelectMultiple(field)) {
            acc.get(name).options = Array.from(field.options);
          }

          return acc;
        }, new Map()),
    []
  );

  const getNodeValue = useCallback<GetNodeValue>(
    (name, fields = fieldsRef.current) => {
      if (!fields.has(name)) return undefined;

      const { field, options } = fields.get(name)!;

      if (isInputElement(field)) {
        if (fieldParsersRef.current[name]?.valueAsNumber)
          return field.valueAsNumber;
        if (fieldParsersRef.current[name]?.valueAsDate)
          return field.valueAsDate;
      }

      if (isNumberInput(field) || isRangeInput(field))
        return field.valueAsNumber || "";

      if (isCheckboxInput(field)) {
        const checkboxes = options as HTMLInputElement[];

        if (checkboxes.length > 1)
          return checkboxes.filter((c) => c.checked).map((c) => c.value);

        const checkbox = checkboxes[0];

        if (checkbox.hasAttribute("value") && checkbox.value)
          return checkbox.checked ? [checkbox.value] : [];

        return checkbox.checked;
      }

      if (isRadioInput(field))
        return (
          (options as HTMLInputElement[]).find((radio) => radio.checked)
            ?.value || ""
        );

      if (isSelectMultiple(field))
        return (options as HTMLOptionElement[])
          .filter((option) => option.selected)
          .map((option) => option.value);

      if (isFileInput(field)) return field.files;

      return field.value;
    },
    []
  );

  const setNodeValue = useCallback(
    (name: string, value: any, fields: Fields = fieldsRef.current) => {
      if (!fields.has(name) || controlsRef.current[name]) return;

      const { field, options } = fields.get(name)!;

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
    (
      name,
      value,
      shouldUpdateDefaultValue = !isFieldArray(fieldArrayRef.current, name) ||
        !isUndefined(get(initialStateRef.current.values, name.split(".")[0]))
    ) => {
      if (shouldUpdateDefaultValue)
        initialStateRef.current.values = set(
          initialStateRef.current.values,
          name,
          value,
          true
        );

      if (!dequal(get(stateRef.current.values, name), value))
        setStateRef(`values.${name}`, value, { shouldSkipUpdate: true });
    },
    [setStateRef, stateRef]
  );

  const setNodesOrValues = useCallback<SetNodesOrValues<V>>(
    (
      values,
      {
        shouldSetValues = true,
        fields = Array.from(fieldsRef.current.keys()),
      } = {}
    ) =>
      fields.forEach((name) => {
        if (controlsRef.current[name]) return;

        const value = get(values, name);

        if (!isUndefined(value)) setNodeValue(name, value);

        if (shouldSetValues)
          setDefaultValue(
            name,
            !isUndefined(value) ? value : getNodeValue(name)
          );
      }),
    [getNodeValue, setDefaultValue, setNodeValue]
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
      if (builtInValidationMode === false || !fieldsRef.current.has(name))
        return undefined;

      const {
        field: { validity, validationMessage },
      } = fieldsRef.current.get(name)!;

      if (builtInValidationMode === "state")
        for (const k in validity)
          if (k !== "valid" && validity[k as keyof ValidityState]) return k;

      return validationMessage;
    },
    [builtInValidationMode]
  );

  const runAllBuiltInValidation = useCallback(() => {
    if (builtInValidationMode === false) return {};

    return Array.from(fieldsRef.current.keys()).reduce((errors, name) => {
      const error = runBuiltInValidation(name);
      errors = { ...errors, ...(error ? set(errors, name, error) : {}) };
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
        acc = { ...acc, ...(errors[idx] ? set(acc, cur, errors[idx]) : {}) };
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

  const getFormState = useCallback<GetFormState<V>>(
    (
      path,
      {
        errorWithTouched,
        defaultValues: dfValues = {},
        methodName = "getState",
        callback,
      } = {}
    ) => {
      const usedState: ObjMap = {};
      const state = parseState(
        path,
        stateRef.current,
        (p) => {
          p = getPath(p);

          if (methodName !== "getState") {
            if (
              p === "values" &&
              methodName !== "useFormStateCallback" &&
              !hasWarnValues.current
            ) {
              warn(
                `💡 react-cool-form > ${methodName}: Getting "values" alone might cause unnecessary re-renders. If you know what you're doing, just ignore this warning. See: https://react-cool-form.netlify.app/docs/getting-started/form-state#best-practices`
              );
              hasWarnValues.current = true;
            }

            usedState[p] = true;
          }

          return p;
        },
        (p, v) => {
          if (methodName === "getState") return v;

          if (p.startsWith("values")) {
            if (!isUndefined(v)) return v;

            p = p.replace("values.", "");
            v = get(initialStateRef.current, p);

            return !isUndefined(v) ? v : get(dfValues, p);
          }

          if (!errorWithTouched || !p.startsWith("errors")) return v;

          p = p.replace("errors", "touched");
          usedState[p] = true;

          return filterErrors(v, get(stateRef.current, p));
        },
        methodName === "getState"
      );

      if (callback) callback(usedState);

      return state;
    },
    [stateRef]
  );

  const mon = useCallback<Mon<V>>(
    (path, { errorWithTouched, defaultValues: dfValues } = {}) =>
      getFormState(path, {
        errorWithTouched,
        defaultValues: dfValues,
        methodName: "mon",
        callback: (usedState) => {
          observersRef.current[0].usedState = {
            ...observersRef.current[0].usedState,
            ...usedState,
          };
        },
      }),
    [getFormState, observersRef]
  );

  const handleFocus = useCallback((name: string) => {
    const field =
      fieldsRef.current.get(name)?.field ||
      fieldsRef.current.get(
        Array.from(fieldsRef.current.keys()).find((n) => n.startsWith(name)) ||
          ""
      )?.field;

    if (field && isFunction(field.focus)) field.focus();
  }, []);

  const focus = useCallback<Focus>(
    (name, delay) => {
      if (!isUndefined(delay)) {
        setTimeout(() => handleFocus(name), delay);
      } else {
        handleFocus(name);
      }
    },
    [handleFocus]
  );

  const getState = useCallback<GetState>((path) => getFormState(path), [
    getFormState,
  ]);

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

      isFieldArray(fieldArrayRef.current, name, (key) =>
        fieldArrayRef.current[key].reset()
      );

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
      removeField,
      focus,
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
          initialStateRef.current.values = nextValues;
          setNodesOrValues(nextValues, {
            shouldSetValues: false,
            fields: Array.from(fieldsRef.current.keys()).filter(
              (name) => !isFieldArray(fieldArrayRef.current, name)
            ),
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
    [getOptions, onResetRef, setNodesOrValues, setStateRef, stateRef]
  );

  const submit: Submit<V> = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      const nextTouched = [
        ...Array.from(fieldsRef.current.keys()),
        ...Object.keys(controlsRef.current),
      ].reduce((touched, name) => {
        touched = set(touched, name, true, true);
        return touched;
      }, stateRef.current.touched);

      setStateRef("touched", nextTouched);
      setStateRef("isSubmitted", false);
      setStateRef("isSubmitting", true);

      try {
        const isValid = await runValidation();

        if (!isValid) {
          const { errors } = stateRef.current;

          onErrorRef.current(errors, getOptions(), e);

          if (focusOnError) {
            let names = Array.isArray(focusOnError)
              ? focusOnError
              : Array.from(fieldsRef.current.keys());
            names = isFunction(focusOnError) ? focusOnError(names) : names;
            const name = names.find((n) => get(errors, n));

            if (name) handleFocus(name);
          }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getOptions,
      handleFocus,
      onErrorRef,
      onSubmitRef,
      runValidation,
      setStateRef,
      stateRef,
    ]
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

  const shouldRemoveField = useCallback<ShouldRemoveField>(
    (name) => {
      if (!removeOnUnmounted) return false;

      let names = Array.isArray(removeOnUnmounted)
        ? removeOnUnmounted
        : [
            ...Array.from(fieldsRef.current.keys()),
            ...Object.keys(controlsRef.current),
            ...Object.keys(fieldArrayRef.current),
          ];
      names = isFunction(removeOnUnmounted) ? removeOnUnmounted(names) : names;

      return names.includes(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const removeField = useCallback<RemoveField>(
    (name, exclude) => {
      const { defaultValue, ...rest } = arrayToMap(exclude || [], {
        value: "values",
        error: "errors",
      });

      if (!defaultValue)
        initialStateRef.current.values = unset(
          initialStateRef.current.values,
          name,
          true
        );

      ["values", "touched", "dirty", "errors"].forEach((key, idx, arr) => {
        const shouldForceUpdate = idx === arr.length - 1;

        if (
          !rest[key] &&
          !isUndefined(get(stateRef.current[key as keyof FormState<V>], name))
        )
          handleUnset(`${key}.${name}`, {
            shouldSkipUpdate: !shouldForceUpdate,
            shouldForceUpdate,
          });
      });

      delete fieldParsersRef.current[name];
      delete fieldValidatorsRef.current[name];
      delete fieldArrayRef.current[name];
      delete controlsRef.current[name];

      if (fieldsRef.current.has(name)) fieldsRef.current.delete(name);
    },
    [handleUnset, stateRef]
  );

  const registerForm = useCallback<RegisterForm>(
    (el) => {
      if (!el) return;

      formRef.current = el;
      const form = formRef.current;

      fieldsRef.current = getFields(form);
      setNodesOrValues(initialStateRef.current.values);

      handlersRef.current.change = ({ target }: Event) => {
        const { name } = target as FieldElement;

        if (fieldsRef.current.has(name) && !controlsRef.current[name]) {
          const parse = fieldParsersRef.current[name]?.parse;
          const value = getNodeValue(name);

          handleChangeEvent(name, parse ? parse(value) : value);
          changedFieldRef.current = name;
        }
      };

      handlersRef.current.blur = ({ target }: Event) => {
        if (!isFieldElement(target as HTMLElement)) return;

        const { name } = target as FieldElement;

        if (fieldsRef.current.has(name) && !controlsRef.current[name]) {
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

      mutationObserverRef.current = new MutationObserver(([{ type }]) => {
        if (type !== "childList") return;

        const fields = getFields(form);
        let { values } = initialStateRef.current;

        fieldsRef.current.forEach((_, name) => {
          if (!shouldRemoveField(name)) return;
          if (controlsRef.current[name]) return;

          if (!fields.has(name)) {
            removeField(
              name,
              !isFieldArray(fieldArrayRef.current, name) ||
                isUndefined(
                  get(initialStateRef.current.values, name.split(".")[0])
                )
                ? undefined
                : ["defaultValue"]
            );

            return;
          }

          const currOptions = fieldsRef.current.get(name)?.options
            ?.length as number;
          const nextOptions = fields.get(name).options?.length as number;

          if (currOptions > nextOptions) {
            setStateRef(`values.${name}`, getNodeValue(name, fields), {
              shouldSkipUpdate: true,
            });
          } else if (currOptions < nextOptions) {
            setNodeValue(name, get(values, name), fields);
          }
        });

        const addedNodes: string[] = [];

        fields.forEach((_, name) => {
          if (fieldsRef.current.has(name) || controlsRef.current[name]) return;

          const value = get(stateRef.current.values, name);
          if (!isUndefined(value)) values = set(values, name, value, true);

          addedNodes.push(name);
        });

        fieldsRef.current = fields;
        if (addedNodes.length) setNodesOrValues(values, { fields: addedNodes });
      });

      mutationObserverRef.current.observe(form, {
        childList: true,
        subtree: true,
      });
    },
    [
      getFields,
      getNodeValue,
      handleChangeEvent,
      removeField,
      reset,
      setNodeValue,
      setNodesOrValues,
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
        controlsRef.current[field.name] ||
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
    validateOnChange,
    shouldRemoveField,
    initialStateRef,
    fieldArrayRef,
    controlsRef,
    observersRef,
    fieldValidatorsRef,
    changedFieldRef,
    setStateRef,
    getNodeValue,
    getFormState,
    setDefaultValue,
    setNodesOrValues,
    setTouchedMaybeValidate,
    handleChangeEvent,
    removeField,
    form: registerForm,
    field: registerField,
    mon,
    focus,
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
        mutationObserverRef.current?.disconnect();
      }

      shared.remove(id);
    },
    [id]
  );

  return {
    form: registerForm,
    field: registerField,
    mon,
    focus,
    removeField,
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
