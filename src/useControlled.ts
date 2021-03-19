import { useCallback, useEffect, useRef } from "react";

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
    defaultValuesRef,
    initialStateRef,
    fieldArrayRef,
    controlledsRef,
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

  const warnDefaultValue = useCallback(() => {
    if (!hasWarn.current) {
      warn(
        `💡 react-cool-form > useControlled: Please provide a default value for "${nameRef.current}" field.`
      );
      hasWarn.current = true;
    }
  }, [nameRef]);

  useEffect(
    () => () => {
      if (shouldRemoveField) removeField(nameRef.current);
    },
    [nameRef, removeField, shouldRemoveField]
  );

  controlledsRef.current[name] = true;
  if (validate) fieldValidatorsRef.current[name] = validate;

  const fieldArrayName = isFieldArray(fieldArrayRef.current, name);
  let value;

  if (fieldArrayName) {
    if (!fieldArrayRef.current[fieldArrayName].fields[name]) {
      if (!isUndefined(defaultValue)) {
        setDefaultValue(name, defaultValue);
        fieldArrayRef.current[fieldArrayName].fields[name] = true;
      } else {
        warnDefaultValue();
      }
    }
  } else if (isUndefined(get(initialStateRef.current.values, name))) {
    value = get(defaultValuesRef.current, name);
    value = !isUndefined(value) ? value : defaultValue;

    if (!isUndefined(value)) {
      setDefaultValue(name, value);
    } else {
      warnDefaultValue();
    }
  }

  value = !isUndefined(meta.value) ? meta.value : value;
  value = (format ? format(value) : value) ?? "";
  const { onChange, onBlur, ...restProps } = props;

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
