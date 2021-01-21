import { useForm } from "react-cool-form";

export default () => {
  const { form, getState, submit } = useForm({
    defaultValues: { test: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const errors = getState("errors");

  return (
    <div ref={form}>
      <input name="test" required />
      {errors.test && <p>{errors.test}</p>}
      <button type="button" onClick={submit}>
        Submit
      </button>
    </div>
  );
};
