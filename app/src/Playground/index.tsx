/* eslint-disable no-console */

import { useForm, useFormState } from "react-cool-form";

export default () => {
  const { form } = useForm({
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log("LOG ===> ", useFormState("values.foo"));

  return (
    <form ref={form}>
      <input name="foo" type="checkbox" />
      <input type="submit" />
    </form>
  );
};
