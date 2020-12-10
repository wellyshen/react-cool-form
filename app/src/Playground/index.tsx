import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
  t2: string;
}

let count = -1;

const Playground = (): JSX.Element => {
  count += 1;
  const { form, getState } = useForm<FormValues>({
    defaultValues: { t1: "", t2: "" },
    onSubmit: (values) => console.log(values),
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <p>{count}</p>
      <input name="t1" required />
      {errors.t1 && <p>{errors.t1}</p>}
      <input name="t2" required />
      {errors.t2 && <p>{errors.t2}</p>}
      <input type="submit" />
    </form>
  );
};

export default Playground;
