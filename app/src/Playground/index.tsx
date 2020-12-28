import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

const defaultValues = {
  t1: "form test",
};

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    onSubmit: (values) => console.log("LOG ===> onSubmit", values),
  });

  return (
    <form ref={form} noValidate>
      <input name="t1" defaultValue="field test" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
