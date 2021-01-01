import { useForm } from "react-cool-form";

interface FormValues {
  foo: any;
}

const defaultValues = {
  foo: [{ bar: "🍎" }],
};

const Playground = (): JSX.Element => {
  const { form, setFieldValue } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
  });

  return (
    <form ref={form} noValidate>
      <input name="foo[0].bar" />
      <button type="button" onClick={() => setFieldValue("foo[0].bar")}>
        Clear
      </button>
      <input type="submit" />
    </form>
  );
};

export default Playground;
