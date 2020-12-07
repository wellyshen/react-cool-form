import { useForm } from "react-cool-form";

interface FormValues {
  text: "";
}

const Playground = (): JSX.Element => {
  const { form, getState } = useForm<FormValues>({
    defaultValues: { text: "" },
  });
  const value = getState({ text: "text" }, { target: "values" });
  // console.log("LOG ===> ", value);

  return (
    <form ref={form} noValidate>
      <input name="text" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
