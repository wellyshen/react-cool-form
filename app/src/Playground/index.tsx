/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, mon } = useForm({
    defaultValues: { foo: "t" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log(
    "LOG ===> ",
    mon(["foo", "touched.foo", "dirty.foo", "errors.foo"])
  );

  return (
    <form ref={form}>
      {show && <input name="foo" required />}
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
    </form>
  );
};
