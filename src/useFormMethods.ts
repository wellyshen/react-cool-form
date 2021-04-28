import { FormMethods, FormValues, Methods } from "./types";
import { get } from "./shared";
import { invariant } from "./utils";

export default <V extends FormValues = FormValues>(
  formId?: string
): FormMethods<V> => {
  const methods: Methods<V> = get(formId);

  invariant(
    !methods,
    '💡 react-cool-form > useFormMethods: It must work with an "useForm" hook. See: https://react-cool-form.netlify.app/docs/api-reference/use-form'
  );

  const {
    form,
    field,
    focus,
    removeField,
    watchState,
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
    focus,
    removeField,
    watchState,
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
