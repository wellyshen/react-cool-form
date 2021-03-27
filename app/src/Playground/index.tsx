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
    defaultValues: { foo: "", baz: "", bar: "", aa: false },
    focusOnError: false,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form}>
      {/* {show && (
        <input
          name="foo"
          // ref={field((value) => (!value.length ? "Required" : false))}
        />
      )} */}
      {/* <input
        type="checkbox"
        name="aa"
        ref={field((value) => (!value ? "Required" : false))}
      /> */}
      {show && (
        <Field
          name="baz"
          validate={(value: any) => (!value.length ? "Required" : false)}
        />
      )}
      <input
        name="bar"
        defaultValue="field-test"
        ref={field((value) => (!value.length ? "Required" : false))}
      />
      <input type="submit" />
      <button type="button" onClick={() => setShow(!show)}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() => {
          setFocus("baz");
          setTimeout(() => setTouched("baz"), 1000);
        }}
      >
        Set Focus
      </button>
    </form>
  );
};
