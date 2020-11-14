import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import {
  Debug,
  FormState,
  FormStateReturn,
  SetStateRef,
  UsedRef,
} from "./types";
import useLatest from "./useLatest";
import { get, isEmptyObject, set } from "./utils";

export default <V>(
  initialState: FormState<V>,
  onChange?: Debug<V>
): FormStateReturn<V> => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const initialValuesRef = useRef(initialState.values);
  const stateRef = useRef(initialState);
  const usedStateRef = useRef<UsedRef>({});
  const onChangeRef = useLatest(onChange);

  const setStateRef = useCallback<SetStateRef>(
    (path, value, actualPath) => {
      const key = path.split(".")[0];

      if (!key) {
        if (!isEqual(stateRef.current, value)) {
          stateRef.current = value;
          forceUpdate();
        }

        return;
      }

      if (key === "values" || !isEqual(get(stateRef.current, path), value)) {
        const state = set(stateRef.current, path, value, true);
        const {
          values,
          errors,
          isDirty: prevIsDirty,
          isValid: prevIsValid,
        } = state;
        let { submitCount: prevSubmitCount } = state;
        const isDirty =
          key === "values"
            ? !isEqual(values, initialValuesRef.current)
            : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;
        const submitCount =
          key === "isSubmitting" && value
            ? (prevSubmitCount += 1)
            : prevSubmitCount;

        stateRef.current = { ...state, isDirty, isValid, submitCount };
        
        path = actualPath || path;

        if (
          Object.keys(usedStateRef.current).some(
            (key) => path.startsWith(key) || key.startsWith(path)
          ) ||
          (usedStateRef.current.isDirty && isDirty !== prevIsDirty) ||
          (usedStateRef.current.isValid && isValid !== prevIsValid)
        )
          forceUpdate();

        if (onChangeRef.current) onChangeRef.current(stateRef.current);
      }
    },
    [onChangeRef]
  );

  const setUsedStateRef = useCallback((path: string) => {
    usedStateRef.current[path] = true;
  }, []);

  return { stateRef, setStateRef, setUsedStateRef };
};
