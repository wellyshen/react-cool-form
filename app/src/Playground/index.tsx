/* eslint-disable no-console */

import { useForm, useFormState } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  const errors = useFormState("errors", { errorWithTouched: true });

  return (
    <form ref={form} noValidate>
      <input name="foo" type="email" required />
      {errors.foo && <p>{errors.foo}</p>}
      <input type="submit" />
    </form>
  );
};
