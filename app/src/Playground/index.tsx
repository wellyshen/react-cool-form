/* eslint-disable no-console */

import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form, select } = useForm({
    defaultValues: { foo: [{ val: "0" }] },
    shouldRemoveField: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo");

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
      <button
        type="button"
        onClick={() => push({ val: "1" }, { isDirty: true })}
      >
        Push
      </button>
      <form ref={form}>
        {fields.map(({ val }, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <input key={idx} name={`foo[${idx}].val`} />
        ))}
        <input type="submit" />
      </form>
    </>
  );
};
