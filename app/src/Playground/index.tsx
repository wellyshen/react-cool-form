/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="foo" />
      <input type="submit" />
    </form>
  );
};
