import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal/es6/react";

import { FormState, StateRef, SetStateRef, UsedStateRef } from "./types";
import { isUndefined, isObject } from "./utils";

const hasProxy = !isUndefined(typeof Proxy);

export default <V>(
  defaultValues: V
): [FormState<V>, StateRef<V>, SetStateRef<V>] => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef<FormState<V>>({
    values: defaultValues,
    touched: {},
    errors: {},
    isValidating: false,
  });
  const useStateRef = useRef<UsedStateRef<V>>({});

  const setStateRef = useCallback<SetStateRef<V>>((target, payload) => {
    const { current: state } = stateRef;
    const { current: usedState } = useStateRef;

    stateRef.current = {
      ...state,
      [target]: isObject(payload)
        ? {
            ...(state[target] as FormState<V>),
            ...(payload as Record<string, any>),
          }
        : payload,
    };

    if (!hasProxy || usedState[target]) forceUpdate();
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
