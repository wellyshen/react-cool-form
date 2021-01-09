import { useEffect } from "react";
import { useForm, set } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  useEffect(() => {
    console.log(set({ a: ["abc"] }, '"a["0"]', "test"));
  }, []);

  return (
    <form ref={form}>
      <input name="test" />
      <input type="submit" />
    </form>
  );
};
