import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

const defaultValues = {
  t1: "",
};

const Playground = (): JSX.Element => {
  const { form, getState } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit", values),
  });

  console.log("LOG ===> ", getState(""));

  return (
    <form ref={form} noValidate>
      <input name="t1" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
