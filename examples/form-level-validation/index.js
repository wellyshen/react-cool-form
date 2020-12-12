import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const validate = async ({ name, email }) => {
  const errors = {};

  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!name.length) errors.name = "Required";

  if (!email.length) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};

function App() {
  const { form } = useForm({
    defaultValues: { name: "", email: "" },
    validate,
    onSubmit: (values) => alert(JSON.stringify(values)),
    onError: (errors) => console.log("onError: ", errors)
  });

  return (
    <form ref={form} noValidate>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
