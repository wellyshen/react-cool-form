import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
}

const defaultValues = {
  t1: "",
};

const Playground = (): JSX.Element => {
  const { form, field } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit", values),
  });

  return (
    <form ref={form} noValidate>
      <input name="t1" type="date" ref={field({ valueAsDate: true })} />
      <input type="submit" />
    </form>
  );
};

export default Playground;
