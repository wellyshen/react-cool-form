import {
  ControlledConfig,
  ControlledReturn,
  FieldProps,
  FormValues,
} from "./types";
import * as shared from "./shared";
import { get, invariant, isFieldElement, isUndefined } from "./utils";
import useFormState from "./useFormState";

export default <V = FormValues, E extends any[] = any[]>(
  name: string,
  // @ts-expect-error
  {
    formId,
    defaultValue,
    validate,
    parse,
    format,
    errorWithTouched,
    exclude,
    ...props
  }: ControlledConfig<V> = {}
): ControlledReturn<E> => {
  invariant(
    !name,
    '💡 react-cool-form > useControlled: Missing the "name" parameter.'
  );

  invariant(
    !formId,
    '💡 react-cool-form > useControlled: Missing the "formId" option. See: https://react-cool-form.netlify.app/docs/api-reference/use-controlled#formid'
  );

  const methods = shared.get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useControlled: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
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
    excludeFieldsRef,
    controllersRef,
    fieldValidatorsRef,
    defaultValuesRef,
    changedFieldRef,
    getNodeValue,
    setDefaultValue,
    setTouchedMaybeValidate,
    handleChangeEvent,
    getState,
    setValue,
    setTouched,
    setDirty,
    setError,
    clearErrors,
    runValidation,
  } = methods;

  let fieldProps: FieldProps<E> | undefined;

  if (exclude) {
    excludeFieldsRef.current[name] = true;
  } else {
    controllersRef.current[name] = true;
    if (validate) fieldValidatorsRef.current[name] = validate;

    let dfValue = get(defaultValuesRef.current, name);
    dfValue = !isUndefined(dfValue) ? dfValue : defaultValue;
    if (!isUndefined(dfValue))
      setDefaultValue(name, dfValue, () => {
        meta.value = defaultValue;
      });

    const { onChange, onBlur, ...restProps } = props;

    fieldProps = {
      name,
      value: (format ? format(meta.value) : meta.value) ?? "",
      onChange: (...args) => {
        let val;

        if (parse) {
          val = parse(...args);
        } else {
          const e = args[0];
          val =
            e?.nativeEvent instanceof Event && isFieldElement(e.target)
              ? getNodeValue(name)
              : e;
        }

        handleChangeEvent(name, val);
        if (onChange) onChange(...args);
        changedFieldRef.current = name;
      },
      onBlur: (e) => {
        setTouchedMaybeValidate(name);
        if (onBlur) onBlur(e);
        changedFieldRef.current = undefined;
      },
      ...restProps,
    };
  }

  return {
    fieldProps,
    meta: { ...meta, isTouched: !!meta.isTouched, isDirty: !!meta.isDirty },
    getState,
    setValue,
    setTouched,
    setDirty,
    setError,
    clearErrors,
    runValidation,
  };
};
