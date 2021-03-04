import { FormReturn, FormValues } from "./types";
import { get } from "./shared";
import { invariant } from "./utils";

export default <V extends FormValues = FormValues>(
  formId?: string
): FormReturn<V> => {
  const methods = get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFormMethods: You must provide the corresponding ID to the "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form#id'
  );

  const {
    form,
    field,
    select,
    getState,
    setValue,
    setTouched,
    setDirty,
    setError,
    clearErrors,
    runValidation,
    reset,
    submit,
  } = methods;

  return {
    form,
    field,
    select,
    getState,
    setValue,
    setTouched,
    setDirty,
    setError,
    clearErrors,
    runValidation,
    reset,
    submit,
  };
};
