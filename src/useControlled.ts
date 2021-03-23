import { useEffect, useRef } from "react";

import { ControlledConfig, ControlledReturn, FormValues } from "./types";
import * as shared from "./shared";
import { useLatest } from "./hooks";
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

  const methods = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useControlled: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
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
    getNodeValue,
    setDefaultValue,
    setTouchedMaybeValidate,
    handleChangeEvent,
    removeField,
  } = methods;
  const hasWarn = useRef(false);
  const nameRef = useLatest(name);

  useEffect(
    () => () => {
      if (shouldRemoveField) removeField(nameRef.current);
    },
    [nameRef, removeField, shouldRemoveField]
  );

  controlsRef.current[name] = true;
  if (validate) fieldValidatorsRef.current[name] = validate;

  if (isUndefined(get(initialStateRef.current.values, name))) {
    if (!isUndefined(defaultValue)) {
      setDefaultValue(name, defaultValue);
    } else if (!isFieldArray(fieldArrayRef.current, name) && !hasWarn.current) {
      warn(
        `💡 react-cool-form > useControlled: Please provide a default value for "${name}" field.`
      );
      hasWarn.current = true;
    }
  }

  const { onChange, onBlur, ...restProps } = props;
  let value = !isUndefined(meta.value) ? meta.value : defaultValue;
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
