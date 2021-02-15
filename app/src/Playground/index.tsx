import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { test: [] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="test" type="checkbox" value="1" />
      <input name="test" type="checkbox" value="2" />
      <input type="submit" />
    </form>
  );
};
