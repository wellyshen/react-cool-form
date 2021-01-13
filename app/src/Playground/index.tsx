import { useEffect } from "react";
import { useForm, unset } from "react-cool-form";

enum FieldNames {
  test = "test",
}

export default () => {
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  useEffect(() => {
    const obj = { a: { b: null } };
    unset(obj, "a.b");
    console.log(obj);
  }, []);

  return (
    <form ref={form}>
      <input name={FieldNames.test} />
      <input type="submit" />
    </form>
  );
};
