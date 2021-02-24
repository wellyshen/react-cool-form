/* eslint-disable no-console */

import { useState, useEffect } from "react";
import { useForm, useControlled } from "react-cool-form";

interface FormValues {
  foo: string;
}

const Field = ({ name, formId, ...rest }: any) => {
  const { fieldProps, meta, setValue } = useControlled<FormValues>(name, {
    formId: "form-1",
    ...rest,
  });

  console.log("LOG ===> Field re-renders: ", meta);

  /* useEffect(() => {
    setValue("foo", undefined);
  }, [setValue]); */

  return (
    <>
      <button type="button" onClick={() => setValue("foo", undefined)}>
        Clear Value
      </button>
      <input {...fieldProps} />
    </>
  );
};

export default () => {
  const [show, setShow] = useState(true);
  const { form } = useForm<FormValues>({
    id: "form-1",
    // defaultValues: { foo: "form test" },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Form re-renders");

  return (
    <>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <form ref={form} noValidate>
        {show && (
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
        )}
        <input type="submit" />
      </form>
    </>
  );
};
