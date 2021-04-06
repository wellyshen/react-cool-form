/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, reset } = useForm({
    defaultValues: { foo: "form test", bar: "form test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {show && <input name="foo" defaultValue="field test" />}
      {show && <Field name="bar" defaultValue="field test" />}
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() =>
          console.log(
            "LOG ===> ",
            reset({ foo: "reset test", bar: "reset test" })
          )
        }
      >
        Reset
      </button>
    </form>
  );
};
