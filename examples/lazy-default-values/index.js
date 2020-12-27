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
  const { form, reset } = useForm({
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  React.useEffect(() => {
    reset({ firstName: "Welly", lastName: "Shen" });
  }, [reset]);

  return (
    <form ref={form} noValidate>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
