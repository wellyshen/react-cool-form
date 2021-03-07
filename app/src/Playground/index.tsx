/* eslint-disable no-console */

import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [t0, setT0] = useState(true);
  const [t1, setT1] = useState(true);
  const { form, select } = useForm({
    defaultValues: { bar: "test", foo: ["v1"] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log("LOG ===> ", select("values.foo"));

  return (
    <form ref={form}>
      {/* <select name="foo">
        {t0 && <option value="v0">v0</option>}
        <option value="v1">v1</option>
      </select> */}
      {t0 && <input name="bar" />}
      {t0 && <input name="foo" type="checkbox" value="v1" />}
      {t1 && <input name="foo" type="checkbox" value="v2" />}
      <br />
      <input type="submit" />
      <input type="reset" />
      <button type="button" onClick={() => setT0(!t0)}>
        T0
      </button>
      <button type="button" onClick={() => setT1(!t1)}>
        T1
      </button>
    </form>
  );
};
