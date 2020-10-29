import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import {
  FormState,
  StateRef,
  SetStateRef,
  UsedRef,
  SetUsedStateRef,
} from "./types";
import { get, set, isEmptyObject } from "./utils";

export default <V>(
  initialValues: V
): [StateRef<V>, SetStateRef, SetUsedStateRef] => {
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
  const usedStateRef = useRef<UsedRef>({});

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
          Object.keys(usedStated).some(
            (key) => path.startsWith(key) || key.startsWith(path)
          ) ||
          (usedStated.isDirty && isDirty !== prevIsDirty) ||
          (usedStated.isValid && isValid !== prevIsValid)
        )
          forceUpdate();
      }
    },
    [initialValues]
  );

  const setUsedStateRef = useCallback((path: string) => {
    usedStateRef.current[path] = true;
  }, []);

  return [stateRef, setStateRef, setUsedStateRef];
};
