import { useEffect } from "react";
import { useForm, set } from "react-cool-form";
// @ts-expect-error
import _ from "lodash";

export default () => {
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  useEffect(() => {
    const obj = { a: ["rcf"] };
    _.unset(obj, "a.0");
    console.log(obj);
  }, []);

  return (
    <form ref={form}>
      <input name="test" />
      <input type="submit" />
    </form>
  );
};
