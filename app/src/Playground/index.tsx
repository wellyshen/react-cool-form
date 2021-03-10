/* eslint-disable no-console */

import { useState, useEffect } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [t0, setT0] = useState(true);
  const [t1, setT1] = useState(true);
  const { form, select, setValue } = useForm({
    // defaultValues: { foo: "test" },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // console.log("LOG ===> ", select("values.foo"));

  useEffect(() => {
    // setValue("foo", "new test");
  }, [setValue]);

  return (
    <form ref={form}>
      {t0 && <input name="foo" defaultValue="test" />}
      <input type="submit" />
      <button type="button" onClick={() => setT0(!t0)}>
        T0
      </button>
      {/* <button type="button" onClick={() => setT1(!t1)}>
        T1
      </button> */}
    </form>
  );
};
