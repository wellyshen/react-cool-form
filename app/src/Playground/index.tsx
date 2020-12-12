import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

let count = -1;

const Playground = (): JSX.Element => {
  count += 1;
  const { form, getState, validateField } = useForm<FormValues>({
    defaultValues: { t1: "" },
    onSubmit: (values) => console.log(values),
  });
  const errors = getState("errors", { filterUntouchedErrors: false });
  console.log("LOG ===> ", errors);

  return (
    <form ref={form} noValidate>
      <button type="button" onClick={() => validateField("t1")}>
        Validate
      </button>
      <p>{count}</p>
      <input name="t1" minLength={5} />
      {errors.t1 && <p>{errors.t1}</p>}
      <input type="submit" />
    </form>
  );
};

export default Playground;
