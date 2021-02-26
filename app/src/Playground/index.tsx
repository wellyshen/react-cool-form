/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled, useFormState } from "react-cool-form";

interface FormValues {
  foo: string;
}

const Field = ({ name, formId, ...rest }: any) => {
  const bar = useFormState("values.bar", { formId: "form-1" });
  const [fieldProps, meta] = useControlled<FormValues>(name, {
    formId: "form-1",
    ...rest,
  });

  console.log("LOG ===> Field re-renders: ", bar);

  return <input {...fieldProps} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, select, setValue } = useForm<FormValues>({
    id: "form-1",
    // defaultValues: { foo: "form test" },
    // shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  // console.log("LOG ===> Form re-renders: ", select("values.bar"));

  return (
    <>
      <button type="button" onClick={() => setValue("foo", undefined)}>
        Clear Value
      </button>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <form ref={form} noValidate>
        {show && <input name="bar" defaultValue="field test" />}
        <Field
          name="foo"
          defaultValue="field test"
          validate={(value: any) => !value.length && "Required"}
          parse={(e: any) => `new ${e.target.value}`}
          format={(value: any) => value.replace("new ", "")}
          // errorWithTouched
          // onChange={(e: any) => console.log("LOG ===> onChange: ", e)}
          // onBlur={(e: any) => console.log("LOG ===> onBlur: ", e)}
        />
        <input type="submit" />
        <input type="reset" />
      </form>
    </>
  );
};
