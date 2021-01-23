import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { test: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="test" type="file" multiple />
      <input type="submit" />
    </form>
  );
};
