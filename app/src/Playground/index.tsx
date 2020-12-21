import { useForm } from "react-cool-form";

interface FormValues {
  t1?: string;
  t2?: string;
}

const defaultValues = {
  // t1: "",
  // t2: "",
};

const Playground = (): JSX.Element => {
  const { form, getState } = useForm<FormValues>({
    defaultValues,
    onSubmit: async (values) => {
      // eslint-disable-next-line compat/compat
      await new Promise((r) => setTimeout(r, 3000));
      console.log("LOG ===> onSubmit: ", values);
    },
  });
  const isSubmitting = getState("isSubmitting");

  return (
    <form ref={form} noValidate>
      <input name="t1" />
      <input name="t2" />
      <input type="submit" disabled={isSubmitting} />
    </form>
  );
};

export default Playground;
