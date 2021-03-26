/* eslint-disable no-console */

import { useForm, useFieldArray } from "react-cool-form";

export default () => {
  const { form } = useForm({
    // defaultValues: { foo: [{ name: "test-1" }] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields] = useFieldArray("foo", { defaultValue: [{ name: "test-1" }] });

  return (
    <form ref={form}>
      {fields.map((fieldName) => (
        <input key={fieldName} name={`${fieldName}.name`} />
      ))}
      <input type="submit" />
    </form>
  );
};
