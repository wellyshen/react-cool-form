import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  FieldArrayConfig,
  FieldArrayReturn,
  FormValues,
  HelperHandler,
  Insert,
  Keys,
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

  const methods = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFieldArray: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
  );

  const {
    validateOnChange,
    shouldRemoveField,
    initialStateRef,
    fieldArrayRef,
    fieldValidatorsRef,
    setDefaultValue,
    getState,
    setStateRef,
    runValidation,
    removeField,
  } = methods;
  const defaultValueRef = useRef<T[] | undefined>(defaultValue);

  const getValue = useCallback(
    (init = false) => {
      let value = getState(`values.${name}`);
      if (init && isUndefined(value)) value = defaultValueRef.current;
      return Array.isArray(value) ? [...value] : [];
    },
    [getState, name]
  );

  const [fields, setFields] = useState<T[]>(getValue(true));

  useEffect(() => {
    if (
      isUndefined(get(initialStateRef.current.values, name)) &&
      !isUndefined(defaultValueRef.current)
    )
      setDefaultValue(name, defaultValueRef.current, true);

    return () => {
      if (shouldRemoveField) removeField(name, true);
    };
  }, [initialStateRef, name, removeField, setDefaultValue, shouldRemoveField]);

  fieldArrayRef.current[name] = useMemo(
    () => ({
      reset: () =>
        setFields((prevFields) => {
          const currFields = getState(`values.${name}`);
          const currFieldsLength = currFields?.length || 0;

          if (prevFields.length === currFieldsLength) return prevFields;
          if (prevFields.length < currFieldsLength) return currFields;

          const nextFields = [...prevFields];
          nextFields.length = currFieldsLength;

          return nextFields;
        }),
      fields: {},
    }),
    [getState, name]
  );
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

      setFields((prevFields) => handler([...prevFields], "values"));
      setStateRef("", { ...state, shouldDirty: getIsDirty(state.dirty) });

      if (validateOnChange) runValidation(name);
    },
    [getState, name, runValidation, setStateRef, validateOnChange]
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
