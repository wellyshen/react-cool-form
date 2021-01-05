import { useForm } from "react-cool-form";

export default () => {
  const { form, getState, runValidation, field } = useForm({
    defaultValues: { t1: "", t2: "" },
    validate: async (values) => {
      const errors = {};
      // eslint-disable-next-line compat/compat
      await new Promise((r) => setTimeout(r, 2000));
      // if (!values.t1.length) errors.t2 = "Form Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  console.log(
    "LOG ===> ",
    getState(
      { isValidating: "isValidating", errors: "errors" },
      {
        filterUntouchedError: false,
      }
    )
  );

  return (
    <form ref={form} noValidate>
      <input
        name="t1"
        // ref={field(async (value) => {
        //   // eslint-disable-next-line compat/compat
        //   await new Promise((r) => setTimeout(r, 2000));
        //   // if (!value) return "Field Required";
        //   return false;
        // })}
        // required
      />
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
