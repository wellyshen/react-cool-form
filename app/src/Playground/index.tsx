import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

const defaultValues = {
  t1: "",
};

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    defaultValues,
    builtInValidationMode: "state",
    onSubmit: (values) => console.log("LOG ===> onSubmit", values),
    onError: (errors) => console.log("LOG ===> onError", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="t1" required />
      <input type="submit" />
    </form>
  );
};

export default Playground;
