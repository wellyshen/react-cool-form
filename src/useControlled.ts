import { useEffect, useRef } from "react";

import {
  ControlledConfig,
  ControlledReturn,
  FormValues,
  Methods,
} from "./types";
import * as shared from "./shared";
import {
  get,
  invariant,
  isFieldArray,
  isFieldElement,
  isUndefined,
  warn,
} from "./utils";
import useFormState from "./useFormState";

export default <V extends FormValues = FormValues>(
  name: string,
  {
    formId,
    defaultValue,
    validate,
    parse,
    format,
    errorWithTouched,
    ...props
  }: ControlledConfig<V> = {}
): ControlledReturn => {
  invariant(
    !name,
    '💡 react-cool-form > useControlled: Missing "name" parameter.'
  );

  const methods: Methods<V> = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useControlled: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
  );

  const meta = useFormState(
    {
      value: `values.${name}`,
      error: `errors.${name}`,
      isTouched: `touched.${name}`,
      isDirty: `dirty.${name}`,
    },
    { formId, errorWithTouched }
  );
  const {
    shouldRemoveField,
    initialStateRef,
    fieldArrayRef,
    controlsRef,
    fieldValidatorsRef,
    changedFieldRef,
    getState,
    getNodeValue,
    setDefaultValue,
    setTouchedMaybeValidate,
    handleChangeEvent,
    removeField,
  } = methods;
  const hasWarn = useRef(false);
  const isFieldArr = isFieldArray(fieldArrayRef.current, name);

  useEffect(
    () => {
      const value = get(initialStateRef.current.values, name);

      if (!isUndefined(value) && isUndefined(getState(name)))
        setDefaultValue(name, value);

      return () => {
        if (shouldRemoveField)
          removeField(name, isFieldArr ? ["defaultValue"] : undefined);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  controlsRef.current[name] = true;
  if (validate) fieldValidatorsRef.current[name] = validate;

  let value = get(initialStateRef.current.values, name);

  if (isUndefined(value)) {
    value = defaultValue;

    if (!isUndefined(defaultValue)) {
      setDefaultValue(name, defaultValue);
    } else if (!isFieldArr && !hasWarn.current) {
      warn(
        `💡 react-cool-form > useControlled: Please provide a default value for "${name}" field.`
      );
      hasWarn.current = true;
    }
  }

  const { onChange, onBlur, ...restProps } = props;
  value = !isUndefined(meta.value) ? meta.value : value;
  value = (format ? format(value) : value) ?? "";

  return [
    {
      name,
      value,
      onChange: (...event) => {
        let val;

        if (parse) {
          val = parse(...event);
        } else {
          const e = event[0];
          val =
            e?.nativeEvent instanceof Event && isFieldElement(e.target)
              ? getNodeValue(name)
              : e;
        }

        handleChangeEvent(name, val);
        if (onChange) onChange(...event);
        changedFieldRef.current = name;
      },
      onBlur: (e) => {
        setTouchedMaybeValidate(name);
        if (onBlur) onBlur(e);
        changedFieldRef.current = undefined;
      },
      ...restProps,
    },
    { error: meta.error, isTouched: !!meta.isTouched, isDirty: !!meta.isDirty },
  ];
};
