/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form, mon } = useForm({
    defaultValues: { foo: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Re-rendering", mon({ foo: "foo" }));

  return (
    <form ref={form}>
      <input name="foo" />
      <input type="submit" />
    </form>
  );
};
