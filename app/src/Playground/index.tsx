/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

const FieldArray = ({ name, ...rest }: any) => {
  const [fields] = useFieldArray(name, rest);
  return (
    <>
      {fields.map((fieldName) => (
        <input key={fieldName} name={`${fieldName}.a`} />
      ))}
    </>
  );
};

export default () => {
  const [show, setShow] = useState(false);
  const { form, getState, setValue } = useForm({
    defaultValues: {
      // foo: [],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo", {
    // defaultValue: [{ a: "field test", b: "field test" }],
  });

  return (
    <form ref={form}>
      {fields.map((name) => (
        <div key={name}>
          {show && <input name={`${name}.a`} defaultValue="field test" />}
          {/* <input name={`${name}.a`} /> */}
          {show && <Field name={`${name}.b`} defaultValue="field test" />}
          {/* <Field name={`${name}.b`} /> */}
        </div>
      ))}
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button type="button" onClick={() => push({ a: "form test" })}>
        Push
      </button>
      <button
        type="button"
        onClick={() => console.log("LOG ===> ", getState())}
      >
        Get State
      </button>
      <button type="button" onClick={() => setValue("foo[0].b", undefined)}>
        Set Value
      </button>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
};
