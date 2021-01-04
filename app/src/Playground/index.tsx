import { useState } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const [toggle, setToggle] = useState(true);
  const { form, getState } = useForm({
    defaultValues: { test: "123" },
  });
  console.log("LOG ===> ", getState("dirty"));

  return (
    <form ref={form}>
      {toggle && <input name="test" />}
      <button type="button" onClick={() => setToggle(!toggle)}>
        Toggle
      </button>
    </form>
  );
};
