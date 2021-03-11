/* eslint-disable no-console */

import { useState, useEffect } from "react";
import { useForm, useControlled } from "react-cool-form";

export default () => {
  const [t0, setT0] = useState(true);
  const { form, select, setValue } = useForm({
    // defaultValues: { foo: "test" },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fieldProps] = useControlled("foo", { defaultValue: "test" });

  useEffect(() => {
    // setValue("foo", "new test");
  }, [setValue]);

  return (
    <form ref={form}>
      {t0 && <input {...fieldProps} />}
      <input type="submit" />
      <input type="reset" />
      {/* <button type="button" onClick={() => setT0(!t0)}>
        T0
      </button> */}
    </form>
  );
};
