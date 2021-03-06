/* eslint-disable no-console */

import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [t0, setT0] = useState(true);
  const [t1, setT1] = useState(true);
  const { form } = useForm({
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {/* <select name="foo">
        {t0 && <option value="v0">v0</option>}
        <option value="v1">v1</option>
      </select> */}
      {t0 && <input name="foo" type="radio" value="R1" />}
      {t1 && <input name="foo" type="radio" value="R2" />}
      <br />
      <input type="submit" />
      <button type="button" onClick={() => setT0(!t0)}>
        T0
      </button>
      <button type="button" onClick={() => setT1(!t1)}>
        T1
      </button>
    </form>
  );
};
