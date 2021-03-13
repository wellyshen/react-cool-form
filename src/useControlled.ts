import { useEffect, useRef } from "react";

import {
  ControlledConfig,
  ControlledReturn,
  FieldProps,
  FormValues,
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

  const methods = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useControlled: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
  );

  const hasWarn = useRef(false);
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
    controllersRef,
    fieldValidatorsRef,
    changedFieldRef,
    getNodeValue,
    setDefaultValue,
    setTouchedMaybeValidate,
    handleChangeEvent,
    removeField,
  } = methods;

  useEffect(
    () => () => {
      if (isFieldArray(fieldArrayRef.current, name) || shouldRemoveField)
        removeField(name);
    },
    [fieldArrayRef, name, removeField, shouldRemoveField]
  );

  controllersRef.current[name] = true;
  if (validate) fieldValidatorsRef.current[name] = validate;

  let value;

  if (isUndefined(get(initialStateRef.current.values, name))) {
    value = get(defaultValuesRef.current, name);
    value = !isUndefined(value) ? value : defaultValue;

    if (!isUndefined(value)) {
      setDefaultValue(name, value);
    } else if (!hasWarn.current) {
      warn(
        `💡 react-cool-form > useControlled: Please provide a default value for the "${name}" field.`
      );
      hasWarn.current = true;
    }
  }

  value = !isUndefined(meta.value) ? meta.value : value;
  value = (format ? format(value) : value) ?? "";
  const { onChange, onBlur, ...restProps } = props;

  const fieldProps: FieldProps = {
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
  };

  return [
    fieldProps,
    { error: meta.error, isTouched: !!meta.isTouched, isDirty: !!meta.isDirty },
  ];
};
