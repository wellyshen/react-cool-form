/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(false);
  const { form, reset } = useForm({
    defaultValues: { foo: ["1", "2"] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="foo" type="checkbox" value="1" defaultChecked />
      {show && <input name="foo" type="checkbox" value="2" defaultChecked />}
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() => console.log("LOG ===> ", reset({ foo: [] }))}
      >
        Reset
      </button>
    </form>
  );
};
