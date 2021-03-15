/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useReducer, useRef } from "react";

import { FormStateConfig, FormValues, Observer, Path } from "./types";
import { get } from "./shared";
import { invariant } from "./utils";

export default <V extends FormValues = FormValues>(
  path: Path,
  { formId, ...rest }: FormStateConfig<V> = {}
): any => {
  const methods = get(formId);
  const methodName = "useFormState";

  invariant(
    !methods,
    `💡 react-cool-form > ${methodName}: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id`
  );

  const observerRef = useRef<Observer>();
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const { getFormState, subscribeObserver, unsubscribeObserver } = methods;

  useEffect(() => {
    // @ts-expect-error
    subscribeObserver(observerRef.current);

    // @ts-expect-error
    return () => unsubscribeObserver(observerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return getFormState(path, {
    ...rest,
    methodName,
    callback: (usedState) => {
      if (!observerRef.current)
        observerRef.current = { usedState, update: forceUpdate };
    },
  });
};
