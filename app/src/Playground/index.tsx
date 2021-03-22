/* eslint-disable no-console */

import { useForm, useFieldArray, useControlled } from "react-cool-form";

const Field = ({ name, ...restProps }: any) => {
  const [props] = useControlled(name, restProps);
  return <input {...props} />;
};

export default () => {
  const { form, mon } = useForm({
    defaultValues: { foo: [{ name: "test-1" }] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push }] = useFieldArray("foo");

  console.log("LOG ===> Re-rendering", mon({ foo: "foo" }));

  return (
    <form ref={form}>
      {fields.map(([fieldName]) => (
        <Field key={fieldName} name={`${fieldName}.name`} />
      ))}
      <button type="button" onClick={() => push({ name: "test-2" })}>
        Push
      </button>
      <input type="submit" />
    </form>
  );
};
