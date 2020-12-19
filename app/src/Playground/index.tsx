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
  const { form, getState, setFieldValue, setValues } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log(values),
  });
  const state = getState({ touched: "touched", dirtyFields: "dirtyFields" });
  console.log("LOG ===> state: ", state);

  useEffect(() => {
    // setFieldValue("t2", "test");
    setValues(
      { t1: "test", t2: "test" },
      { touchedFields: ["t1", "t2"], dirtyFields: ["t1", "t2"] }
    );
  }, [setFieldValue, setValues]);

  return (
    <form ref={form} noValidate>
      <input name="t1" />
      <input name="t2" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
