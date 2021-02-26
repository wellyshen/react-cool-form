/* eslint-disable no-console */

import { useState, memo } from "react";
import { useForm, useControlled } from "react-cool-form";

interface FormValues {
  foo?: string;
  bar?: string;
}

const Field = memo(({ name, ...rest }: any) => {
  const [props] = useControlled(name, { ...rest });

  // console.log("LOG ====> Field re-renders");

  return <input {...props} />;
});

export default () => {
  const [show, setShow] = useState(true);
  const { form, select, reset } = useForm<FormValues>({
    id: "form-1",
    // defaultValues: { foo: "form test", bar: "form test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log(
    "LOG ===> Form re-renders: ",
    select(["values.bar", "values.foo"], {
      defaultValues: { bar: "select test", foo: "select test" },
    })
  );

  return (
    <form ref={form} noValidate>
      {show && <input name="foo" defaultValue="field test" />}
      {show && <Field name="bar" formId="form-1" defaultValue="field test" />}
      <input type="submit" />
      <input type="reset" />
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
    </form>
  );
};
