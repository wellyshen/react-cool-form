import { useEffect } from "react";
import { useForm } from "react-cool-form";

interface FormValues {
  t1?: string;
  t2: string;
}

const defaultValues = {
  // t1: "form test",
  t2: "form test",
};

const Playground = (): JSX.Element => {
  const { form, reset, getState } = useForm<FormValues>();
  console.log(
    "LOG ===> ",
    getState({ isDirty: "isDirty", dirtyFields: "dirtyFields" })
  );

  useEffect(() => {
    reset({ t2: "new test" });
  }, [reset]);

  return (
    <form ref={form} noValidate>
      <input name="t1" defaultValue="field test" />
      <input name="t2" />
      <input type="submit" />
      <input type="reset" />
    </form>
  );
};

export default Playground;
