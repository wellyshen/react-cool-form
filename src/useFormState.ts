import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import {
  FormState,
  FormStateReturn,
  ResetStateRef,
  SetStateRef,
  UsedRef,
} from "./types";
import { get, set, isEmptyObject } from "./utils";

export default <V>(initialValues: V): FormStateReturn<V> => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const initialState = useRef<FormState<V>>({
    values: initialValues,
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
    isValid: true,
    isValidating: false,
    isSubmitting: false,
    submitCount: 0,
  });
  const stateRef = useRef(initialState.current);
  const usedStateRef = useRef<UsedRef>({});

  const setStateRef = useCallback<SetStateRef>((path, value) => {
    const { current: state } = stateRef;
    const key = path.split(".")[0];
    const shouldUpdate = key === "values" || !isEqual(get(state, path), value);

    if (shouldUpdate) {
      const nextState = set(state, path, value, true);
      const {
        values,
        errors,
        isDirty: prevIsDirty,
        isValid: prevIsValid,
      } = nextState;
      const isDirty =
        key === "values"
          ? !isEqual(values, initialState.current.values)
          : prevIsDirty;
      const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;

      stateRef.current = { ...nextState, isDirty, isValid };

      const { current: usedStated } = usedStateRef;

      if (
        Object.keys(usedStated).some(
          (key) => path.startsWith(key) || key.startsWith(path)
        ) ||
        (usedStated.isDirty && isDirty !== prevIsDirty) ||
        (usedStated.isValid && isValid !== prevIsValid)
      )
        forceUpdate();
    }
  }, []);

  const resetStateRef = useCallback<ResetStateRef<V>>(
    (values = initialState.current.values, exclude, callback) => {
      [
        "values",
        "touched",
        "errors",
        "isDirty",
        "dirtyFields",
        "isValid",
        "submitCount",
      ].forEach((key) => {
        const k = key as keyof FormState<V>;

        if (exclude.length && exclude.includes(k)) return;

        if (k === "values") {
          stateRef.current[k] = values;
          callback(values);
        } else {
          // @ts-expect-error
          stateRef.current[k] = initialState.current[k];
        }
      });

      forceUpdate();
    },
    []
  );

  const setUsedStateRef = useCallback((path: string) => {
    usedStateRef.current[path] = true;
  }, []);

  return { stateRef, setStateRef, resetStateRef, setUsedStateRef };
};
