import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import {
  Debug,
  FormState,
  FormStateReturn,
  ResetStateRef,
  SetStateRef,
  UsedRef,
} from "./types";
import useLatest from "./useLatest";
import { get, isEmptyObject, set } from "./utils";

export default <V>(
  initialValues: V,
  onChange?: Debug<V>
): FormStateReturn<V> => {
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
  const onChangeRef = useLatest(onChange);

  const setStateRef = useCallback<SetStateRef>(
    (path, value) => {
      const key = path.split(".")[0];
      const shouldUpdate =
        key === "values" || !isEqual(get(stateRef.current, path), value);

      if (shouldUpdate) {
        const nextState = set(stateRef.current, path, value, true);
        const {
          values,
          errors,
          isDirty: prevIsDirty,
          isValid: prevIsValid,
        } = nextState;
        let { submitCount: prevSubmitCount } = nextState;
        const isDirty =
          key === "values"
            ? !isEqual(values, initialStateRef.current.values)
            : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;
        const submitCount =
          key === "isSubmitting" && value
            ? (prevSubmitCount += 1)
            : prevSubmitCount;

        stateRef.current = { ...nextState, isDirty, isValid, submitCount };

        if (onChangeRef.current) onChangeRef.current(stateRef.current);

        if (
          Object.keys(usedStateRef.current).some(
            (key) => path.startsWith(key) || key.startsWith(path)
          ) ||
          (usedStateRef.current.isDirty && isDirty !== prevIsDirty) ||
          (usedStateRef.current.isValid && isValid !== prevIsValid)
        )
          forceUpdate();
      }
    },
    [onChangeRef]
  );

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
