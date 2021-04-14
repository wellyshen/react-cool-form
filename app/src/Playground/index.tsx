/* eslint-disable no-console */

import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const { form } = useForm({
    defaultValues: {
      foo: [{ a: "t1" }, { a: "t2" }],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {show1 && <input name="foo[0].a" />}
      {show2 && <input name="foo[1].a" />}
      <button type="button" onClick={() => setShow1(!show1)}>
        Toggle 1
      </button>
      <button type="button" onClick={() => setShow2(!show2)}>
        Toggle 2
      </button>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
};
