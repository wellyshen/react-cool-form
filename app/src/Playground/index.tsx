/* eslint-disable no-console */

import { useState, useEffect } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [t0, setT0] = useState(true);
  const { form, reset } = useForm({
    // defaultValues: { foo: "form test" },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  useEffect(() => {
    // reset({ foo: "form test" });
  }, [reset]);

  return (
    <form ref={form}>
      {t0 && <Field name="foo" defaultValue="field test" />}
      <input type="submit" />
      <input type="reset" />
      <button type="button" onClick={() => setT0(!t0)}>
        T0
      </button>
    </form>
  );
};
