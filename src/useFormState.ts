import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal/es6/react";

import { FormState, StateRef, SetStateRef, UsedStateRef } from "./types";
import { get, set } from "./utils";

const hasProxy = "Proxy" in window;

export default <V>(
  defaultValues: V
): [FormState<V>, StateRef<V>, SetStateRef] => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef<FormState<V>>({
    values: defaultValues,
    touched: {},
    errors: {},
    isValidating: false,
  });
  const useStateRef = useRef<UsedStateRef<V>>({});

  const setStateRef = useCallback<SetStateRef>((path, value) => {
    const { current: state } = stateRef;
    const type = path.split(".")[0] as keyof FormState<V>;
    const shouldUpdate = type === "values" || !isEqual(get(state, path), value);

    if (shouldUpdate) {
      stateRef.current = { ...state, ...set(state, path, value) };
      if (!hasProxy || useStateRef.current[type]) forceUpdate();
    }
  }, []);

  return [
    hasProxy
      ? new Proxy(stateRef.current, {
          get: (target, key: keyof FormState<V>) => {
            if (target[key]) useStateRef.current[key] = true;
            return target[key];
          },
        })
      : stateRef.current,
    stateRef,
    setStateRef,
  ];
};
