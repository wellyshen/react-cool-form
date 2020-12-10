import { useForm } from "react-cool-form";

interface FormValues {
  text: string;
}

const Playground = (): JSX.Element => {
  const { form, getState } = useForm<FormValues>({
    defaultValues: { text: "" },
    onSubmit: (values) => console.log(values),
  });
  const errors = getState("errors");
  console.log("LOG ===> Render!");

  return (
    <form ref={form} noValidate>
      <input name="text" required />
      {errors.text && <p>{errors.text}</p>}
      <input type="submit" />
    </form>
  );
};

export default Playground;
