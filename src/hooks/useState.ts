import { useReducer, useRef, useCallback } from "react";
import { dequal } from "dequal/lite";

import {
  Debug,
  FormState,
  FormStateReturn,
  Map,
  SetStateRef,
  SetUsedStateRef,
} from "../types";
import useLatest from "./useLatest";
import { get, getIsDirty, isEmptyObject, set } from "../utils";

export default <V>(
  initialState: FormState<V>,
  onChange?: Debug<V>
): FormStateReturn<V> => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef(initialState);
  const usedStateRef = useRef<Map>({});
  const onChangeRef = useLatest(onChange || (() => undefined));

  const setStateRef = useCallback<SetStateRef>(
    (path, value, { fieldPath, shouldUpdate = true } = {}) => {
      const key = path.split(".")[0];

      if (!key) {
        if (!dequal(stateRef.current, value)) {
          stateRef.current = value;
          forceUpdate();
          onChangeRef.current(stateRef.current);
        }

        return;
      }

      if (
        (path !== "values" && key === "values") ||
        !dequal(get(stateRef.current, path), value)
      ) {
        const state = set(stateRef.current, path, value, true);
        const {
          errors,
          dirty,
          isDirty: prevIsDirty,
          isValid: prevIsValid,
        } = state;
        let { submitCount: prevSubmitCount } = state;
        const isDirty =
          key === "dirty" ? getIsDirty(dirty) : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;
        const submitCount =
          key === "isSubmitting" && value
            ? (prevSubmitCount += 1)
            : prevSubmitCount;

        stateRef.current = { ...state, isDirty, isValid, submitCount };

        path = fieldPath || path;

        if (
          shouldUpdate &&
          (Object.keys(usedStateRef.current).some(
            (key) => path.startsWith(key) || key.startsWith(path)
          ) ||
            (usedStateRef.current.isDirty && isDirty !== prevIsDirty) ||
            (usedStateRef.current.isValid && isValid !== prevIsValid))
        ) {
          forceUpdate();
          onChangeRef.current(stateRef.current);
        }
      }
    },
    [onChangeRef]
  );

  const setUsedStateRef = useCallback<SetUsedStateRef>((path) => {
    usedStateRef.current[path] = true;
  }, []);

  return { stateRef, setStateRef, setUsedStateRef };
};
