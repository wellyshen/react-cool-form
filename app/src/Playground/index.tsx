/* eslint-disable no-console */

import { useForm, useFormState } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  console.log("LOG ===> ", useFormState("foo"));

  return (
    <form ref={form} noValidate>
      <input name="foo" />
    </form>
  );
};
