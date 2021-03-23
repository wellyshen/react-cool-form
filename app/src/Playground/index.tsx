/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const Field = ({ name, ...restProps }: any) => {
  const [props] = useControlled(name, restProps);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, mon } = useForm({
    defaultValues: { foo: [{ name: "test-1", conditional: "conditional-1" }] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo");

  console.log("LOG ===> Re-rendering", mon({ foo: "foo" }));

  return (
    <form ref={form}>
      {fields.map((fieldName) => (
        <div key={fieldName}>
          <Field name={`${fieldName}.name`} />
          {show && (
            <Field
              name={`${fieldName}.conditional`}
              defaultValue="conditional-2"
            />
          )}
        </div>
      ))}
      <button type="button" onClick={() => push({ name: "test-2" })}>
        Push
      </button>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>

      <input type="submit" />
    </form>
  );
};
