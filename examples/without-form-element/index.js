import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const Field = ({ label, id, error, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

function App() {
  const { form, getState, submit } = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
  });
  const errors = getState("errors", { errorWithTouched: true });

  return (
    <div ref={form}>
      <Field
        label="Email"
        id="email"
        name="email"
        type="email"
        required
        error={errors.email}
      />
      <Field
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
        error={errors.password}
      />
      <button onClick={submit}>Submit</button>
    </div>
  );
}

render(<App />, document.getElementById("root"));
