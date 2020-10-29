import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import { FormState, StateRef, SetStateRef, UsedStateRef } from "./types";
import { get, set, isEmptyObject } from "./utils";

const hasProxy = "Proxy" in window;

export default <V>(
  initialValues: V
): [FormState<V>, StateRef<V>, SetStateRef] => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef<FormState<V>>({
    values: initialValues,
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
    isValid: true,
    isValidating: false,
  });
  const usedStateRef = useRef<UsedStateRef<V>>({});

  const setStateRef = useCallback<SetStateRef>(
    (path, value) => {
      const { current: state } = stateRef;
      const key = path.split(".")[0] as keyof FormState<V>;
      const shouldUpdate =
        key === "values" || !isEqual(get(state, path), value);

      if (shouldUpdate) {
        const nextState = set(state, path, value, true);
        const {
          values,
          errors,
          isDirty: prevIsDirty,
          isValid: prevIsValid,
        } = nextState;
        const isDirty =
          key === "values" ? !isEqual(values, initialValues) : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;

        stateRef.current = { ...nextState, isDirty, isValid };

        const { current: usedStated } = usedStateRef;

        if (
          !hasProxy ||
          usedStated[key] ||
          (usedStated.isDirty && isDirty !== prevIsDirty) ||
          (usedStated.isValid && isValid !== prevIsValid)
        )
          forceUpdate();
      }
    },
    [initialValues]
  );

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
