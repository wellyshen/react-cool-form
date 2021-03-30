/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: { a: "", b: "", c: "" } },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="foo.a" required />
      <input name="foo.b" required />
      <input name="foo.c" required />
      <input type="submit" />
    </form>
  );
};
