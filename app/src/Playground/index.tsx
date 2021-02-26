/* eslint-disable no-console */

import { useState } from "react";
import { useForm } from "react-cool-form";

interface FormValues {
  foo: string;
}

export default () => {
  const [show, setShow] = useState(true);
  const { form, select, reset } = useForm<FormValues>({
    // defaultValues: { foo: "form test" },
    // shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Form re-renders: ", select("values"));

  return (
    <>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <form ref={form} noValidate>
        {show && <input name="foo" defaultValue="field test" />}
        <input type="submit" />
        <input type="reset" />
      </form>
    </>
  );
};
