/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    defaultValues: { foo: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input data-rcf-exclude />
    </form>
  );
};
