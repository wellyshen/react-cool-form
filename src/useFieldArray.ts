import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FieldArrayConfig,
  FieldArrayReturn,
  HelperHandler,
  Insert,
  Keys,
  Move,
  Push,
  Remove,
  Replace,
  Swap,
} from "./types";
import * as shared from "./shared";
import {
  compact,
  getIsDirty,
  invariant,
  isUndefined,
  set,
  setValuesAsTrue,
} from "./utils";

export default <V = any>(
  name: string,
  { formId, validateOnChange = true }: FieldArrayConfig = {}
): FieldArrayReturn<V> => {
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
    shouldRemoveField,
    fieldArrayRef,
    getState,
    setStateRef,
    runValidation,
    removeField,
  } = methods;

  const getValue = useCallback(
    () =>
      Array.isArray(getState(`values.${name}`))
        ? [...getState(`values.${name}`)]
        : [],
    [getState, name]
  );

  const [fields, setFields] = useState<V[]>(getValue());

  useEffect(
    () => () => {
      if (shouldRemoveField) removeField(name);
    },
    [name, removeField, shouldRemoveField]
  );

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

  const push = useCallback<Push<V>>(
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

  const insert = useCallback<Insert<V>>(
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

  const replace = useCallback<Replace<V>>(
    (index, value, { shouldTouched, shouldDirty = true } = {}) => {
      const fieldValue = getState(`values.${name}`);
      if (!Array.isArray(fieldValue) || index > fieldValue.length - 1) return;

      const handler: HelperHandler = (val, type) => {
        if (type === "values") {
          val[index] = value;
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          val[index] = setValuesAsTrue(value);
        } else if (index < val.length - 1) {
          delete val[index];
        } else {
          val.splice(index, 1);
        }

        return compact(val).length ? val : [];
      };

      setState(handler, { shouldTouched, shouldDirty });
    },
    [getState, name, setState]
  );

  const remove = useCallback<Remove<V>>(
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

  return [fields, { push, insert, replace, remove, swap, move }];
};
