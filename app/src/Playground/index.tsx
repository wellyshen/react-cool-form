/* eslint-disable no-console */

import { useForm, useFormState } from "react-cool-form";

export default () => {
  const { form } = useForm({
    // id: "form-1",
    defaultValues: { foo: "foo", bar: "bar" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  const data = useFormState(
    "foo",
    // (state) => console.log("LOG ===> Callback: ", state),
    // "form-1"
  );
  console.log("LOG ===> Re-render: ", data);

  return (
    <form ref={form}>
      <input name="foo" />
      <input name="bar" />
      <input type="submit" />
    </form>
  );
};
