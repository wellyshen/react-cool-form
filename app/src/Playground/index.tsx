/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

interface FormValues {
  foo: string;
}

const Field = ({ name, ...rest }: any) => {
  const [props, meta] = useControlled(name, { ...rest });

  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, select, reset } = useForm<FormValues>({
    id: "form-1",
    // defaultValues: { foo: "form test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log(
    "LOG ===> Form re-renders: ",
    // @ts-expect-error
    select("values.bar", { defaultValues: { bar: "field test" } })
  );

  return (
    <form ref={form} noValidate>
      {/* {show && <input name="foo" defaultValue="field test" />} */}
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
