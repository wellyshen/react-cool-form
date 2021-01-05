import { useForm } from "react-cool-form";

export default () => {
  const { form, getState, runValidation, field } = useForm({
    defaultValues: { t1: "", t2: "" },
    validate: (values) => {
      const errors = {};
      // if (!values.t1.length) errors.t2 = "Form Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log(
    "LOG ===> ",
    getState(
      { errors: "errors" },
      {
        filterUntouchedError: false,
      }
    )
  );

  return (
    <form ref={form} noValidate>
      <input name="t1" ref={field((value) => false)} />
      <input name="t2" required />
      <input type="submit" />
      <button
        type="button"
        onClick={async () => {
          const res = await runValidation("t1");
          console.log(res);
        }}
      >
        Validate
      </button>
    </form>
  );
};
