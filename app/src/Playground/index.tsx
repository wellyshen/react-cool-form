/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFieldArray, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(true);
  const { form } = useForm({
    defaultValues: {
      foo: [
        { a: "form t-1", b: "form t-1" },
        { a: "form t-2", b: "form t-2" },
      ],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { remove, push }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map((n, i) => (
        <div key={n}>
          {show1 && <input name={`${n}.a`} defaultValue={`field t-${i}`} />}
          {show2 && <Field name={`${n}.b`} defaultValue={`field t-${i}`} />}
        </div>
      ))}
      <button type="button" onClick={() => setShow1(!show1)}>
        Toggle 1
      </button>
      <button type="button" onClick={() => setShow2(!show2)}>
        Toggle 2
      </button>
      <button
        type="button"
        onClick={() =>
          push({ a: `push t-${fields.length}`, b: `push t-${fields.length}` })
        }
      >
        Push
      </button>
      <button type="button" onClick={() => remove(1)}>
        Remove
      </button>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
};
