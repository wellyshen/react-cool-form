import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import { FormState, StateRef, SetStateRef, UsedStateRef } from "./types";
import { get, set, isEmptyObject } from "./utils";

const hasProxy = "Proxy" in window;

export default <V>(
  defaultValues: V
): [FormState<V>, StateRef<V>, SetStateRef] => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef<FormState<V>>({
    values: defaultValues,
    touched: {},
    errors: {},
    isValid: true,
    isValidating: false,
  });
  const usedStateRef = useRef<UsedStateRef<V>>({});

  const setStateRef = useCallback<SetStateRef>((path, value) => {
    const { current: state } = stateRef;
    const type = path.split(".")[0] as keyof FormState<V>;
    const shouldUpdate = type === "values" || !isEqual(get(state, path), value);

    if (shouldUpdate) {
      stateRef.current = { ...state, ...set(state, path, value) };
      stateRef.current.isValid = isEmptyObject(stateRef.current.errors);
      if (!hasProxy || usedStateRef.current[type]) forceUpdate();
    }
  }, []);

  return [
    hasProxy
      ? new Proxy(stateRef.current, {
          get: (obj, prop: keyof FormState<V>) => {
            if (prop in obj) usedStateRef.current[prop] = true;
            return obj[prop];
          },
        })
      : stateRef.current,
    stateRef,
    setStateRef,
  ];
};
