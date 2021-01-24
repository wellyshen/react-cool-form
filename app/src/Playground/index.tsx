import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="test" />
      <input type="submit" />
    </form>
  );
};
