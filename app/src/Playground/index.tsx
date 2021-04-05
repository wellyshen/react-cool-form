/* eslint-disable no-console */

import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [show, setShow] = useState(true);
  const { form, getState } = useForm({
    defaultValues: { foo: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {show && <input name="foo" />}
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() => console.log("LOG ===> ", getState("foo"))}
      >
        Get State
      </button>
    </form>
  );
};
