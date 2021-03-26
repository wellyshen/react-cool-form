/* eslint-disable no-console */

import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: [{ name: "test-1" }] },
    onSubmit: (values, { getState }) => console.log("onSubmit: ", getState()),
  });
  const [fields, { remove }] = useFieldArray("foo", {
    // defaultValue: [{ name: "test-1" }],
  });

  return (
    <form ref={form}>
      {fields.map((fieldName) => (
        <input key={fieldName} name={`${fieldName}.name`} />
      ))}
      <button type="button" onClick={() => remove(0)}>
        Remove
      </button>
      <input type="submit" />
    </form>
  );
};
