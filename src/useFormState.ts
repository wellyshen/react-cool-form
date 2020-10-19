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
    const key = path.split(".")[0] as keyof FormState<V>;
    const shouldUpdate = key === "values" || !isEqual(get(state, path), value);

    if (shouldUpdate) {
      const nextState = set(state, path, value, true);
      const { errors, isValid } = nextState;

      stateRef.current = {
        ...nextState,
        isValid: key === "errors" ? isEmptyObject(errors) : isValid,
      };
      if (!hasProxy || usedStateRef.current[key]) forceUpdate();
    }
  }, []);

  return [
    hasProxy
      ? new Proxy(stateRef.current, {
          get: (obj, key: keyof FormState<V>) => {
            if (key in obj) usedStateRef.current[key] = true;
            return obj[key];
          },
        })
      : stateRef.current,
    stateRef,
    setStateRef,
  ];
};
