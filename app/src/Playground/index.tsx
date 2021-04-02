/* eslint-disable no-console */

import { useForm, useFormState } from "react-cool-form";

const Field = ({ name, error, ...rest }: any) => {
  const errors = useFormState("errors", { errorWithTouched: true });

  return (
    <>
      <input name={name} {...rest} />
      {errors && <p>{errors[name]}</p>}
    </>
  );
};

export default () => {
  const { form, mon } = useForm({
    defaultValues: { foo: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  // const errors = mon("errors", { errorWithTouched: true });
  // const errors = useFormState("errors", { errorWithTouched: true });

  return (
    <form ref={form} noValidate>
      <Field name="foo" required />
      {/* <input name="foo" required />
      {errors.foo && <p>{errors.foo}</p>} */}
      <input type="submit" />
    </form>
  );
};
