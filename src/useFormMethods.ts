import { FormMethods, FormValues, Methods } from "./types";
import { get } from "./shared";
import { invariant } from "./utils";

export default <V extends FormValues = FormValues>(
  formId?: string
): FormMethods<V> => {
  const methods: Methods<V> = get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFormMethods: You must provide the corresponding ID to "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
  );

  const {
    form,
    field,
    mon,
    getState,
    setValue,
    setTouched,
    setDirty,
    setFocus,
    setError,
    clearErrors,
    runValidation,
    reset,
    submit,
  } = methods;

  return {
    form,
    field,
    mon,
    getState,
    setValue,
    setTouched,
    setDirty,
    setFocus,
    setError,
    clearErrors,
    runValidation,
    reset,
    submit,
  };
};
