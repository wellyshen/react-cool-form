import { useForm } from "react-cool-form";

export default () => {
  const { form, getState, clearErrors } = useForm({
    defaultValues: { t1: { a: "" }, t2: { a: { b: "" } } },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log("LOG ===> ", getState("errors.t1.a"));

  return (
    <form ref={form} noValidate>
      <input name="t1.a" required />
      <input name="t2.a.b" required />
      <input type="submit" />
      <button type="button" onClick={() => clearErrors(["t1.a"])}>
        Clear
      </button>
    </form>
  );
};
