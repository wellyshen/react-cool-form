/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form, runValidation, mon, field } = useForm({
    defaultValues: { foo: "" },
    // validate: async () => {
    //   // eslint-disable-next-line compat/compat
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    //   return { foo: "Required" };
    // },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> ", mon("errors"));

  return (
    <form ref={form} noValidate>
      <input
        name="foo"
        ref={field(async () => {
          // eslint-disable-next-line compat/compat
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return false;
          // return "Required";
        })}
      />
      <button type="button" onClick={() => runValidation(null, true)}>
        Validate
      </button>
    </form>
  );
};
