/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, field, focus } = useForm({
    defaultValues: { foo: { a: "", b: "", c: "" }, bar: "" },
    focusOnError: ["foo.b", "foo.a", "foo.c"],
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form}>
      {show && (
        <div>
          <input
            name="foo.a"
            ref={field((value) => (!value.length ? "Required" : false))}
          />
        </div>
      )}
      {show && (
        <Field
          name="foo.b"
          validate={(value: any) => (!value.length ? "Required" : false)}
        />
      )}
      <input
        name="foo.c"
        ref={field((value) => (!value.length ? "Required" : false))}
      />
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button type="button" onClick={() => focus("foo")}>
        Set Focus
      </button>
    </form>
  );
};
