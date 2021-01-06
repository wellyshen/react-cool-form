import { useEffect } from "react";
import { useForm } from "react-cool-form";

export default () => {
  const { form, setValue, setError } = useForm({
    defaultValues: { test: "test" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  useEffect(() => {
    setValue("test", undefined);
    setError("test", undefined);
  }, [setError, setValue]);

  return (
    <form ref={form}>
      <input name="test" />
      <input type="submit" />
    </form>
  );
};
