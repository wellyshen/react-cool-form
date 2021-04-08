/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFormState } from "react-cool-form";

const Isolated = ({ name }: any) => {
  const data = useFormState(name);
  console.log("LOG ===> Isolated: ", data);
  return null;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, mon } = useForm({
    defaultValues: { foo: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Re-render");

  return (
    <form ref={form}>
      <input name="foo" />
      {show && <Isolated name="foo" />}
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
    </form>
  );
};
