import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const Field = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
);

function App() {
  const { form } = useForm({
    defaultValues: { firstName: "Welly", lastName: "Shen" },
    onReset: (values) => console.log("onReset: ", values)
  });

  return (
    <form ref={form}>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
