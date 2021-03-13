/* eslint-disable no-console */

import { useRef } from "react";
import { useForm, useFieldArray } from "react-cool-form";

const getId = () => Math.floor(Math.random() * 10000);

export default () => {
  const rmRef = useRef<HTMLInputElement>(null);
  const { form, select } = useForm({
    defaultValues: { foo: [{ id: getId(), val: getId() }] },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push, remove }] = useFieldArray("foo");

  console.log(
    "LOG ===> ",
    select({
      values: "values.foo",
      touched: "touched.foo",
      errors: "errors.foo",
      dirty: "dirty.foo",
      isDirty: "isDirty",
    })
  );

  return (
    <>
      <button type="button" onClick={() => push({ id: getId(), val: getId() })}>
        Push
      </button>
      <br />
      <button
        type="button"
        onClick={() =>
          // @ts-expect-error
          console.log("LOG ===> Remove: ", remove(+rmRef.current.value))
        }
      >
        Remove
      </button>
      <input ref={rmRef} />
      <form ref={form}>
        {fields.map(({ id }, idx) => (
          <input key={id} name={`foo[${idx}].val`} />
        ))}
        <input type="submit" />
        <input type="reset" />
      </form>
    </>
  );
};
