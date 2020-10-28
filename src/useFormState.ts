import { useReducer, useRef, useCallback } from "react";
import isEqual from "fast-deep-equal";

import {
  FormState,
  StateRef,
  SetStateRef,
  UsedStateRef,
  SetUsedStateRef,
} from "./types";
import { get, set, isEmptyObject } from "./utils";

export default <V>(
  defaultValues: V
): [StateRef<V>, SetStateRef, SetUsedStateRef] => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const stateRef = useRef<FormState<V>>({
    values: defaultValues,
    touched: {},
    errors: {},
    isDirty: false,
    dirtyFields: {},
    isValid: true,
    isValidating: false,
  });
  const usedStateRef = useRef<UsedStateRef>({});

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
          key === "values" ? !isEqual(values, defaultValues) : prevIsDirty;
        const isValid = key === "errors" ? isEmptyObject(errors) : prevIsValid;

        stateRef.current = { ...nextState, isDirty, isValid };

        const { current: usedStated } = usedStateRef;

        console.log("LOG ===> ", usedStated, path);

        if (
          Object.keys(usedStated).some((key) => path.startsWith(key)) ||
          (usedStated.isDirty && isDirty !== prevIsDirty) ||
          (usedStated.isValid && isValid !== prevIsValid)
        )
          forceUpdate();
      }
    },
    [defaultValues]
  );

  const setUsedStateRef = useCallback((path: string) => {
    usedStateRef.current[path] = true;
  }, []);

  return [stateRef, setStateRef, setUsedStateRef];
};
