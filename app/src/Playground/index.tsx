/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, getState } = useForm({
    shouldRemoveField: false,
    defaultValues: {
      foo: "test",
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {show && <Field name="foo" />}
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() => console.log("LOG ===> ", getState())}
      >
        Get State
      </button>
      <input type="submit" />
    </form>
  );
};
