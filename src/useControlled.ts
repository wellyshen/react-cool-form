import { useEffect } from "react";

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

  useEffect(
    () => {
      const isFieldArr = isFieldArray(fieldArrayRef.current, name);
      const initialVal = get(initialStateRef.current.values, name);

      if (isUndefined(initialVal)) {
        if (
          !isUndefined(defaultValue) &&
          (!isFieldArr ||
            !isUndefined(
              get(initialStateRef.current.values, name.split(".")[0])
            ))
        ) {
          setDefaultValue(name, defaultValue);
        } else if (!isFieldArr) {
          warn(
            `💡 react-cool-form > useControlled: Please provide a default value for "${name}" field.`
          );
        }
      } else if (isUndefined(getState(name))) {
        setDefaultValue(name, initialVal);
      }

      return () => {
        if (shouldRemoveField)
          removeField(
            name,
            !isFieldArr ||
              isUndefined(
                // eslint-disable-next-line react-hooks/exhaustive-deps
                get(initialStateRef.current.values, name.split(".")[0])
              )
              ? undefined
              : ["defaultValue"]
          );
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  controlsRef.current[name] = true;
  if (validate) fieldValidatorsRef.current[name] = validate;

  const { onChange, onBlur, ...restProps } = props;
  let value = get(initialStateRef.current.values, name);
  value = !isUndefined(value) ? value : defaultValue;
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
