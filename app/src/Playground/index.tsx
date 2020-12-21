import { useEffect } from "react";
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
  const { form, setValues, getState } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit: ", values),
  });
  const state = getState({ touched: "touched", dirtyFields: "dirtyFields" });
  console.log("LOG ===> ", state);

  useEffect(() => {
    setValues(
      { t1: "test", t2: "test" },
      { touchedFields: ["t1"], dirtyFields: ["t2"] }
    );
  }, [setValues]);

  return (
    <form ref={form} noValidate>
      <input name="t1" required />
      <input name="t2" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
