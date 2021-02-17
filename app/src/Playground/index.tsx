import { useForm, useFormState } from "react-cool-form";

const Field = (props: any) => {
  const foo = useFormState("values.foo", { formId: "form-1" });
  console.log("LOG ====> Field: ", foo);

  return <input {...props} />;
};

export default () => {
  const { form } = useForm({
    id: "form-1",
    defaultValues: { foo: "form" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log("LOG ====> Form");

  return (
    <form ref={form}>
      <Field name="foo" />
      <input type="submit" />
    </form>
  );
};
