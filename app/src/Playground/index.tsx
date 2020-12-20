import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
  t2: string;
}

const defaultValues = {
  t1: "",
  t2: "",
};

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values, { formState }) => {
      console.log("LOG ===> onSubmit: ", formState);
    },
    onError: (errors, { formState }) => {
      console.log("LOG ===> onError: ", formState);
    },
  });

  return (
    <form ref={form} noValidate>
      <input name="t1" required />
      <input name="t2" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
