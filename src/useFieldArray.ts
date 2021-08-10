import { useCallback, useEffect, useRef, useState } from "react";

import {
  FieldArrayConfig,
  FieldArrayReturn,
  FormValues,
  Insert,
  Keys,
  Methods,
  Move,
  Push,
  Remove,
  StateHandler,
  Swap,
} from "./types";
import * as shared from "./shared";
import {
  compact,
  get,
  getIsDirty,
  getUid,
  invariant,
  isUndefined,
  set,
  setValuesAsTrue,
} from "./utils";

export default <T = any, V extends FormValues = FormValues>(
  name: string,
  { formId, defaultValue, validate }: FieldArrayConfig<T, V> = {}
): FieldArrayReturn<T> => {
  const methods: Methods<V> = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFieldArray: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
  );

  const {
    validateOnChange,
    shouldRemoveField,
    initialStateRef,
    fieldArrayRef,
    fieldValidatorsRef,
    getState,
    setDefaultValue,
    setNodesOrValues,
    setStateRef,
    runValidation,
    removeField,
  } = methods;
  const keysRef = useRef<string[]>([]);

  const getFields = useCallback(
    (init = false) => {
      let fields = getState(name);

      if (init && isUndefined(fields)) fields = defaultValue;

      return Array.isArray(fields)
        ? fields.map((_, index) => {
            keysRef.current[index] = keysRef.current[index] || getUid();
            return keysRef.current[index];
          })
        : [];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getState, name]
  );

  const [fields, setFields] = useState(getFields(true));

  useEffect(
    () =>
      setNodesOrValues(getState("values"), {
        shouldSetValues: false,
        fields: Object.keys(fieldArrayRef.current.get(name)!.fields),
      }),
    [fieldArrayRef, fields, getState, name, setNodesOrValues]
  );

  useEffect(() => {
    if (
      isUndefined(get(initialStateRef.current.values, name)) &&
      !isUndefined(defaultValue)
    ) {
      setDefaultValue(name, defaultValue, true);
      setFields(getFields());
    }

    return () => {
      if (shouldRemoveField(name)) removeField(name, ["defaultValue"]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!fieldArrayRef.current.has(name))
    fieldArrayRef.current.set(name, {
      update: () => setFields(getFields()),
      fields: {},
    });
  if (validate) fieldValidatorsRef.current[name] = validate;

  const setState = useCallback(
    (
      handler: StateHandler,
      {
        shouldTouched,
        shouldDirty,
      }: { shouldTouched?: boolean; shouldDirty?: boolean } = {}
    ) => {
      let state = getState();

      (["values", "touched", "errors", "dirty"] as Keys[]).forEach((key) => {
        const value = get(state[key], name);
        const fieldsLength = get(state.values, name)?.length;

        if (
          key === "values" ||
          (key === "touched" && shouldTouched) ||
          (key === "dirty" && shouldDirty) ||
          !isUndefined(value)
        )
          state = set(
            state,
            `${key}.${name}`,
            handler(
              Array.isArray(value) ? [...value] : [],
              key,
              fieldsLength ? fieldsLength - 1 : 0
            ),
            true
          );
      });

      setStateRef("", { ...state, shouldDirty: getIsDirty(state.dirty) });
      setFields(getFields());

      if (validateOnChange) runValidation(name);
    },
    [getFields, getState, name, runValidation, setStateRef, validateOnChange]
  );

  const push = useCallback<Push<T>>(
    (value, { shouldTouched, shouldDirty = true } = {}) => {
      const handler: StateHandler = (f, type, lastIndex = 0) => {
        if (type === "values") {
          f.push(value);
          keysRef.current.push(getUid());
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
      const handler: StateHandler = (f, type) => {
        if (type === "values") {
          f.splice(index, 0, value);
          keysRef.current.splice(index, 0, getUid());
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
      const handler: StateHandler = (f) => {
        f.splice(index, 1);
        keysRef.current.splice(index, 1);
        return compact(f).length ? f : [];
      };
      const value = (getState(name) || [])[index];

      setState(handler);

      return value;
    },
    [getState, name, setState]
  );

  const swap = useCallback<Swap>(
    (indexA, indexB) => {
      const handler: StateHandler = (f) => {
        [f[indexA], f[indexB]] = [f[indexB], f[indexA]];
        [keysRef.current[indexA], keysRef.current[indexB]] = [
          keysRef.current[indexB],
          keysRef.current[indexA],
        ];
        return f;
      };

      setState(handler);
    },
    [setState]
  );

  const move = useCallback<Move>(
    (from, to) => {
      const handler: StateHandler = (f) => {
        f.splice(to, 0, f.splice(from, 1)[0]);
        keysRef.current.splice(to, 0, f.splice(from, 1)[0]);
        return f;
      };

      setState(handler);
    },
    [setState]
  );

  return [fields, { push, insert, remove, swap, move }];
};
