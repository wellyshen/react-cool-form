/* eslint-disable no-console */

import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form, focus } = useForm({
    defaultValues: { foo: [{ a: "test-1", b: "test-1" }] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map((name) => (
        <div key={name}>
          <input name={`${name}.a`} />
          <input name={`${name}.b`} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          push({ a: "test-2", b: "test-2" });
          focus(`foo[${fields.length}]`, 300);
          // focus(`foo[${fields.length}].b`, 300);
        }}
      >
        Push
      </button>
    </form>
  );
};
