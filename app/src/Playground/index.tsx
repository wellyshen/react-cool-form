import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values, { formState }) =>
      console.log("onSubmit: ", formState.values),
  });

  return (
    <form ref={form}>
      <input name="test" />
      <input type="submit" />
    </form>
  );
};
