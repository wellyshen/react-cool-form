import { useCallback, useEffect, useRef, useState } from "react";

import {
  FieldArrayConfig,
  FieldArrayReturn,
  FormValues,
  HelperHandler,
  Insert,
  Keys,
  Methods,
  Move,
  Push,
  Remove,
  Swap,
} from "./types";
import * as shared from "./shared";
import {
  compact,
  get,
  getIsDirty,
  invariant,
  isUndefined,
  set,
  setValuesAsTrue,
} from "./utils";

export default <T = any, V extends FormValues = FormValues>(
  name: string,
  { formId, defaultValue, validate }: FieldArrayConfig<T, V> = {}
): FieldArrayReturn<T> => {
  invariant(
    !name,
    '💡 react-cool-form > useFieldArray: Missing "name" parameter.'
  );

  const methods: Methods<V> = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFieldArray: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
  );

  const {
    validateOnChange,
    shouldRemoveField,
    initialStateRef,
    fieldArrayRef,
    fieldValidatorsRef,
    setDefaultValue,
    setNodesOrValues,
    getState,
    setStateRef,
    runValidation,
    removeField,
  } = methods;
  const defaultValueRef = useRef<T[] | undefined>(defaultValue);

  const getFields = useCallback(
    (init = false): string[] => {
      let fields = getState(`values.${name}`);

      if (init && isUndefined(fields)) fields = defaultValueRef.current;

      return Array.isArray(fields)
        ? fields.map((_, index) => `${name}[${index}]`)
        : [];
    },
    [getState, name]
  );

  const [fields, setFields] = useState<string[]>(getFields(true));

  const updateFields = useCallback(() => {
    setFields(getFields());
    setNodesOrValues(getState("values"), {
      shouldSetValues: false,
      fields: Object.keys(fieldArrayRef.current[name].fields),
    });
  }, [fieldArrayRef, getFields, getState, name, setNodesOrValues]);

  useEffect(() => {
    if (
      isUndefined(get(initialStateRef.current.values, name)) &&
      !isUndefined(defaultValueRef.current)
    ) {
      setDefaultValue(name, defaultValueRef.current, true);
      updateFields();
    }

    return () => {
      if (shouldRemoveField) removeField(name, true);
    };
  }, [
    initialStateRef,
    name,
    removeField,
    setDefaultValue,
    shouldRemoveField,
    updateFields,
  ]);

  if (!fieldArrayRef.current[name])
    fieldArrayRef.current[name] = {
      reset: updateFields,
      fields: {},
    };
  if (validate) fieldValidatorsRef.current[name] = validate;

  const setState = useCallback(
    (
      handler: HelperHandler,
      {
        shouldTouched,
        shouldDirty,
      }: { shouldTouched?: boolean; shouldDirty?: boolean } = {}
    ) => {
      let state = getState();

      (["values", "touched", "errors", "dirty"] as Keys[]).forEach((key) => {
        const currFields = state[key][name];

        if (
          key === "values" ||
          (key === "touched" && shouldTouched) ||
          (key === "dirty" && shouldDirty) ||
          !isUndefined(currFields)
        )
          state = set(
            state,
            key,
            {
              ...state[key],
              [name]: handler(
                Array.isArray(currFields) ? [...currFields] : [],
                key,
                state.values[name]?.length - 1 || 0
              ),
            },
            true
          );
      });

      setStateRef("", { ...state, shouldDirty: getIsDirty(state.dirty) });
      updateFields();

      if (validateOnChange) runValidation(name);
    },
    [getState, name, runValidation, setStateRef, updateFields, validateOnChange]
  );

  const push = useCallback<Push<T>>(
    (value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler: HelperHandler = (f, type, lastIndex = 0) => {
        if (type === "values") {
          f.push(value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          f[lastIndex] = setValuesAsTrue(value);
        }

        return f;
      };

      setState(handler, { shouldTouched, shouldDirty });
    },
    [setState]
  );

  const insert = useCallback<Insert<T>>(
    (index, value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler: HelperHandler = (f, type) => {
        if (type === "values") {
          f.splice(index, 0, value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          f[index] = setValuesAsTrue(value);
        } else if (index < f.length) {
          f.splice(index, 0, undefined);
        }

        return f;
      };

      setState(handler, { shouldTouched, shouldDirty });
    },
    [setState]
  );

  const remove = useCallback<Remove<T>>(
    (index) => {
      const handler: HelperHandler = (f) => {
        f.splice(index, 1);
        return compact(f).length ? f : [];
      };
      const value = (getState(`values.${name}`) || [])[index];

      setState(handler);

      return value;
    },
    [getState, name, setState]
  );

  const swap = useCallback<Swap>(
    (indexA, indexB) => {
      const handler: HelperHandler = (f) => {
        [f[indexA], f[indexB]] = [f[indexB], f[indexA]];
        return f;
      };

      setState(handler);
    },
    [setState]
  );

  const move = useCallback<Move>(
    (from, to) => {
      const handler: HelperHandler = (f) => {
        f.splice(to, 0, f.splice(from, 1)[0]);
        return f;
      };

      setState(handler);
    },
    [setState]
  );

  return [fields, { push, insert, remove, swap, move }];
};
