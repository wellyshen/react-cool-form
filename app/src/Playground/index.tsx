import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

const defaultValues = {
  t1: "form values",
};

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log(values),
  });

  return (
    <form ref={form} noValidate>
      <input name="t1" />
    </form>
  );
};

export default Playground;
