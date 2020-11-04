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
  const initialStateRef = useRef<FormState<V>>({
    values: initialValues,
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
    isValidating: false,
    isValid: true,
    isSubmitting: false,
    isSubmitted: false,
    submitCount: 0,
  });
  const stateRef = useRef(initialStateRef.current);
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
          ? !isEqual(values, initialStateRef.current.values)
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
    (values = initialStateRef.current.values, exclude, callback) => {
      Object.keys(initialStateRef.current)
        .filter((key) => !exclude.includes(key as keyof FormState<V>))
        .forEach((key) => {
          if (key === "values") {
            stateRef.current[key] = values;
            callback(values);
          } else {
            // @ts-expect-error
            stateRef.current[key] = initialStateRef.current[key];
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
