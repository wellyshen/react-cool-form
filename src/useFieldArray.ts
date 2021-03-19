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
      if (shouldRemoveField) removeField(name);
    };
  }, [initialStateRef, name, removeField, setDefaultValue, shouldRemoveField]);

  fieldArrayRef.current[name] = useMemo(
    () => ({
      reset: () =>
        setFields((prevFields) => {
          let nextFields = [...prevFields];
          const valueLength = getState(`values.${name}`)?.length || 0;

          if (nextFields.length > valueLength) {
            nextFields.length = valueLength;
          } else {
            nextFields = getValue();
          }

          return nextFields;
        }),
      fields: {},
    }),
    [getState, getValue, name]
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
        const value = state[key][name];

        if (
          key === "values" ||
          (key === "touched" && shouldTouched) ||
          (key === "dirty" && shouldDirty) ||
          !isUndefined(value)
        )
          state = set(
            state,
            key,
            {
              ...state[key],
              [name]: handler(
                Array.isArray(value) ? [...value] : [],
                key,
                state.values[name]?.length - 1 || 0
              ),
            },
            true
          );
      });

      setFields(handler([...fields], "values"));
      setStateRef("", { ...state, shouldDirty: getIsDirty(state.dirty) });

      if (validateOnChange) runValidation(name);
    },
    [fields, getState, name, runValidation, setStateRef, validateOnChange]
  );

  const push = useCallback<Push<T>>(
    (value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler: HelperHandler = (val, type, lastIndex = 0) => {
        if (type === "values") {
          val.push(value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          val[lastIndex] = setValuesAsTrue(value);
        }

        return val;
      };

      setState(handler, { shouldTouched, shouldDirty });
    },
    [setState]
  );

  const insert = useCallback<Insert<T>>(
    (index, value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler: HelperHandler = (val, type) => {
        if (type === "values") {
          val.splice(index, 0, value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          val[index] = setValuesAsTrue(value);
        } else if (index < val.length) {
          val.splice(index, 0, undefined);
        }

        return val;
      };

      setState(handler, { shouldTouched, shouldDirty });
    },
    [setState]
  );

  const remove = useCallback<Remove<T>>(
    (index) => {
      const handler: HelperHandler = (val) => {
        val.splice(index, 1);
        return compact(val).length ? val : [];
      };
      const value = (getState(`values.${name}`) || [])[index];

      setState(handler);

      return value;
    },
    [getState, name, setState]
  );

  const swap = useCallback<Swap>(
    (indexA, indexB) => {
      const handler: HelperHandler = (val) => {
        [val[indexA], val[indexB]] = [val[indexB], val[indexA]];
        return val;
      };

      setState(handler);
    },
    [setState]
  );

  const move = useCallback<Move>(
    (from, to) => {
      const handler: HelperHandler = (val) => {
        val.splice(to, 0, val.splice(from, 1)[0]);
        return val;
      };

      setState(handler);
    },
    [setState]
  );

  return [fields, { push, insert, remove, swap, move }];
};
