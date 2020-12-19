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
    onSubmit: (values) => console.log(values),
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <input name="t1" required />
      {errors.t1 && <p>{errors.t1}</p>}
      <input type="submit" />
    </form>
  );
};

export default Playground;
