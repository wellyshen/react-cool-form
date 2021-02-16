import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [value, setValue] = useState("state");
  const { form, controller } = useForm({
    // defaultValues: { foo: "form" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input
        {...controller("foo", {
          value,
          defaultValue: 0,
        })}
      />
      <input type="submit" />
    </form>
  );
};
