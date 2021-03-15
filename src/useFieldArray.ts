import { useCallback, useEffect, useState } from "react";
import { dequal } from "dequal/lite";

import {
  FieldArrayConfig,
  FieldArrayReturn,
  Insert,
  Move,
  Push,
  Remove,
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

type Keys = "values" | "touched" | "errors" | "dirty";

export default <V = any>(
  name: string,
  { formId }: FieldArrayConfig = {}
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

  const { fieldArrayRef, getState, setStateRef } = methods;

  const getValues = useCallback(
    () =>
      Array.isArray(getState(`values.${name}`))
        ? [...getState(`values.${name}`)]
        : [],
    [getState, name]
  );

  const [fields, setFields] = useState<V[]>(getValues());

  useEffect(() => {
    const { current: fieldArray } = fieldArrayRef;

    fieldArray[name] = {
      reset: () =>
        setFields((prevFields) => {
          let nextFields = [...prevFields];
          const valuesLength = getState(`values.${name}`)?.length || 0;

          if (nextFields.length > valuesLength) {
            nextFields.length = valuesLength;
          } else {
            nextFields = getValues();
          }

          return nextFields;
        }),
    };

    return () => {
      delete fieldArray[name];
    };
  }, [fieldArrayRef, getState, getValues, name]);

  const setFormState = useCallback(
    (
      handler: (values: any[], type: Keys, lastIndex?: number) => any[],
      {
        shouldTouched,
        shouldDirty,
      }: { shouldTouched?: boolean; shouldDirty?: boolean } = {}
    ) => {
      let state = getState();

      (["values", "touched", "errors", "dirty"] as Keys[]).forEach((key) => {
        const values = state[key][name];

        if (
          key === "values" ||
          (key === "touched" && shouldTouched) ||
          (key === "dirty" && shouldDirty) ||
          !isUndefined(values)
        )
          state = set(
            state,
            key,
            {
              ...state[key],
              [name]: handler(
                Array.isArray(values) ? [...values] : [],
                key,
                state.values[name]?.length - 1 || 0
              ),
            },
            true
          );
      });

      setFields(handler([...fields], "values"));
      setStateRef("", { ...state, shouldDirty: getIsDirty(state.dirty) });
    },
    [fields, getState, name, setStateRef]
  );

  const push = useCallback<Push<V>>(
    (value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler = (values: any[], type: Keys, lastIndex = 0) => {
        if (type === "values") {
          values.push(value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          values[lastIndex] = setValuesAsTrue(value);
        }

        return values;
      };

      setFormState(handler, { shouldTouched, shouldDirty });
    },
    [setFormState]
  );

  const insert = useCallback<Insert<V>>(
    (index, value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler = (values: any[], type: Keys) => {
        if (type === "values") {
          values.splice(index, 0, value);
        } else if (
          (type === "touched" && shouldTouched) ||
          (type === "dirty" && shouldDirty)
        ) {
          values[index] = setValuesAsTrue(value);
        } else if (index < values.length) {
          values.splice(index, 0, undefined);
        }

        return values;
      };

      setFormState(handler, { shouldTouched, shouldDirty });
    },
    [setFormState]
  );

  const remove = useCallback<Remove<V>>(
    (index) => {
      const handler = (values: any[]) => {
        values.splice(index, 1);
        return compact(values).length ? values : [];
      };
      const value = (getState(`values.${name}`) || [])[index];

      setFormState(handler);

      return value;
    },
    [getState, name, setFormState]
  );

  const swap = useCallback<Swap>(
    (indexA, indexB) => {
      const value = getState(`values.${name}`);

      if (dequal(value[indexA], value[indexB])) return;

      const handler = (values: any[]) => {
        [values[indexA], values[indexB]] = [values[indexB], values[indexA]];
        return values;
      };

      setFormState(handler);
    },
    [getState, name, setFormState]
  );

  const move = useCallback<Move>(
    (from, to) => {
      const handler = (values: any[]) => {
        values.splice(to, 0, values.splice(from, 1)[0]);
        return values;
      };

      setFormState(handler);
    },
    [setFormState]
  );

  return [fields, { push, insert, remove, swap, move }];
};
