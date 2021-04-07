/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useReducer, useRef } from "react";

import {
  FormStateCallback,
  FormStateConfig,
  FormValues,
  Methods,
  Observer,
  Path,
} from "./types";
import { get } from "./shared";
import { invariant, isFunction, parseState } from "./utils";

export default <V extends FormValues = FormValues>(
  path: Path,
  configOrCallback: FormStateCallback | FormStateConfig<V>,
  formId?: string
): any => {
  const config = !isFunction(configOrCallback) ? configOrCallback : {};
  const methods: Methods<V> = get(config?.formId || formId);

  invariant(
    !methods,
    `💡 react-cool-form > useFormState: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form`
  );

  const observerRef = useRef<Observer<V>>();
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const { observersRef, getFormState } = methods;
  const callback = isFunction(configOrCallback) ? configOrCallback : undefined;

  useEffect(() => {
    observersRef.current.push(observerRef.current!);

    return () => {
      observersRef.current = observersRef.current.filter(
        (o) => o !== observerRef.current
      );
    };
  }, [observersRef]);

  return getFormState(path, {
    ...config,
    methodName: callback ? "useFormStateCallback" : "useFormState",
    callback: (usedState) => {
      if (!observerRef.current)
        observerRef.current = {
          usedState,
          notify: callback
            ? (state) => callback(parseState(path, state))
            : forceUpdate,
        };
    },
  });
};
