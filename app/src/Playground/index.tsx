/* eslint-disable no-console */

import { useForm, useFieldArray, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const { form, reset } = useForm({
    defaultValues: {
      foo: [
        { a: "a1", b: "b1" },
        { a: "a2", b: "b2" },
      ],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { remove }] = useFieldArray("foo");

  console.log("LOG ===> Re-render");

  return (
    <form ref={form}>
      {fields.map((fieldName) => (
        <div key={fieldName}>
          <input name={`${fieldName}.a`} />
          <Field name={`${fieldName}.b`} />
        </div>
      ))}
      <input type="submit" />
      <button type="button" onClick={() => remove(0)}>
        Remove
      </button>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
    </form>
  );
};
