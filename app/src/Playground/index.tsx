/* eslint-disable no-console */

import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      {/*
      @ts-expect-error */}
      <input name="foo" type="checkbox" value={false} />
      <input type="submit" />
    </form>
  );
};
