/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form, runValidation } = useForm({
    validate: () => ({ foo: "Required" }),
    // focusOnError: ["foo", "bar"],
  });

  return (
    <>
      <form ref={form} noValidate>
        <input name="foo" />
        <input name="bar" required />
        {/* <input type="submit" /> */}
      </form>
      <button type="button" onClick={() => runValidation(["bar"])}>
        Validate
      </button>
    </>
  );
};
