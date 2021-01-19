import { useState } from "react";
import { useForm } from "react-cool-form";

const Form = () => {
  const [show, setShow] = useState(true);
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values, { formState }) =>
      console.log("onSubmit: ", formState.values),
  });

  return (
    <>
      <button type="button" onClick={() => setShow(!show)}>
        Internal Toggle
      </button>
      {show && (
        <form ref={form}>
          <input name="test" />
          <input type="submit" />
        </form>
      )}
    </>
  );
};

export default () => {
  const [show, setShow] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShow(!show)}>
        External Toggle
      </button>
      {show && <Form />}
    </>
  );
};
