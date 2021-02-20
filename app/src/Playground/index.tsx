/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFormState } from "react-cool-form";

const Field = (props: any) => {
  const foo = useFormState("values.foo", { formId: "form-1" });

  console.log("Field re-renders: ", foo);

  return <input {...props} />;
};

const Form = (): any => {
  const { form } = useForm({
    id: "form-1",
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("Form re-renders");

  return (
    <form ref={form}>
      <Field name="foo" />
      <input type="submit" />
    </form>
  );
};

export default () => {
  const [show, setShow] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      {show && <Form />}
    </>
  );
};
