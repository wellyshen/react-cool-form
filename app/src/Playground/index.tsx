/* eslint-disable no-console */

import { useState } from "react";
import { useForm, useControlled } from "react-cool-form";

const Field = ({ name, ...rest }: any) => {
  const [props] = useControlled(name, rest);
  return <input {...props} />;
};

export default () => {
  const [show, setShow] = useState(true);
  const { form, field, setFocus, setTouched } = useForm({
    defaultValues: { foo: { a: "", b: "", c: "" }, bar: "" },
    shouldFocusError: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors, { setFocus: focus }) => {
      console.log("onError: ", errors);
      focus((names) => {
        // eslint-disable-next-line no-param-reassign
        [names[0], names[1]] = [names[1], names[0]];
        return names;
      });
    },
  });

  return (
    <form ref={form}>
      {/* {show && (
        <div>
          <input
            name="foo.a"
            ref={field((value) => (!value.length ? "Required" : false))}
          />
        </div>
      )} */}
      <input
        name="foo.a"
        ref={field((value) => (!value.length ? "Required" : false))}
      />
      {/* {show && (
        <Field
          name="foo.b"
          validate={(value: any) => (!value.length ? "Required" : false)}
        />
      )} */}
      <Field
        name="foo.b"
        validate={(value: any) => (!value.length ? "Required" : false)}
      />
      <input
        name="foo.c"
        ref={field((value) => (!value.length ? "Required" : false))}
      />
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() => {
          setFocus("foo");
          // setTimeout(() => setTouched("baz"), 1000);
        }}
      >
        Set Focus
      </button>
    </form>
  );
};
