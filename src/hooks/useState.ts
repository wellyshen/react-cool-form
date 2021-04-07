import { useReducer, useRef, useCallback } from "react";
import { dequal } from "dequal/lite";

import {
  Debug,
  FormState,
  FormStateReturn,
  Observer,
  ObserverHandler,
  SetStateRef,
  SetUsedState,
} from "../types";
import useLatest from "./useLatest";
import { get, getIsDirty, isEmptyObject, set } from "../utils";

export default <V>(
  initialState: FormState<V>,
  onChange?: Debug<V>
): FormStateReturn<V> => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef(initialState);
  const observersRef = useRef<Observer<V>[]>([
    { usedState: {}, notify: forceUpdate },
  ]);
  const onChangeRef = useLatest(onChange || (() => undefined));

  const setStateRef = useCallback<SetStateRef>(
    (path, value, { fieldPath, shouldSkipUpdate, shouldForceUpdate } = {}) => {
      const key = path.split(".")[0];

      if (!key) {
        if (!dequal(stateRef.current, value)) {
          stateRef.current = value;
          onChangeRef.current(stateRef.current);

          if (shouldSkipUpdate) return;

          observersRef.current.forEach(({ usedState, notify }) => {
            if (shouldForceUpdate || !isEmptyObject(usedState))
              notify(stateRef.current);
          });
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
          submitCount: prevSubmitCount,
        } = state;
        let { submitCount: currSubmitCount } = state;
        const isDirty = key === "dirty" ? getIsDirty(dirty) : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;
        const submitCount =
          key === "isSubmitting" && value
            ? (currSubmitCount += 1)
            : currSubmitCount;

        stateRef.current = { ...state, isDirty, isValid, submitCount };
        onChangeRef.current(stateRef.current);

        if (shouldSkipUpdate) return;

        path = fieldPath || path;
        observersRef.current.forEach(({ usedState, notify }) => {
          if (
            shouldForceUpdate ||
            Object.keys(usedState).some(
              (k) => path.startsWith(k) || k.startsWith(path)
            ) ||
            (usedState.isDirty && isDirty !== prevIsDirty) ||
            (usedState.isValid && isValid !== prevIsValid) ||
            (usedState.submitCount && submitCount !== prevSubmitCount)
          )
            notify(stateRef.current);
        });
      }
    },
    [onChangeRef]
  );

  const setUsedState = useCallback<SetUsedState>((usedState) => {
    observersRef.current[0].usedState = {
      ...observersRef.current[0].usedState,
      ...usedState,
    };
  }, []);

  const subscribeObserver = useCallback<ObserverHandler<V>>(
    (observer) => observersRef.current.push(observer),
    []
  );

  const unsubscribeObserver = useCallback<ObserverHandler<V>>((observer) => {
    observersRef.current = observersRef.current.filter((o) => o !== observer);
  }, []);

  return {
    stateRef,
    setStateRef,
    setUsedState,
    subscribeObserver,
    unsubscribeObserver,
  };
};
