/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form, mon } = useForm({
    defaultValues: {
      foo: [{ a: "form t-1" }],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo");
  const foo = mon("foo");

  console.log("LOG ===> HI!");

  return (
    <form ref={form}>
      {fields.map((n) => (
        <input key={n} name={`${n}.a`} />
      ))}
      <button
        type="button"
        onClick={() => push({ a: `push t-${fields.length}` })}
      >
        Push
      </button>
      <input type="submit" />
    </form>
  );
};
