/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useReducer, useRef } from "react";

import { Observer, Path, StateConfig } from "./types";
import { get } from "./shared";
import { invariant } from "./utils";

export default (
  path: Path,
  // @ts-expect-error
  { formId, ...rest }: StateConfig = {}
): any => {
  const methodName = "useFormState";

  invariant(
    !formId,
    `💡 react-cool-form > ${methodName}: Missing the "formId" option. See: https://react-cool-form.netlify.app/docs/api-reference/use-form-state#formid`
  );

  const methods = get(formId);

  invariant(
    !methods,
    `💡 react-cool-form > ${methodName}: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id`
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
