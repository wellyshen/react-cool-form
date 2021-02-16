import { useState } from "react";
import { useForm } from "react-cool-form";

const Field = ({ name }: any) => {
  const [show, setShow] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      {show && <input name={name} />}
    </>
  );
};

export default () => {
  const { form, select, setValue } = useForm({
    defaultValues: { foo: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log("LOG ===> ", select("values.foo"));

  return (
    <>
      <button type="button" onClick={() => setValue("foo", "new test")}>
        Set Value
      </button>
      <form ref={form}>
        <Field name="foo" />
        <input type="submit" />
      </form>
    </>
  );
};
