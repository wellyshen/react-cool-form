import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const submitHandler = async (values) => {
  await new Promise((r) => setTimeout(r, 2000));
  alert(JSON.stringify(values, undefined, 2));
};

const errorHandler = (errors) => {
  console.log("onError: ", errors);
};

function App() {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: submitHandler,
    onError: errorHandler
  });
  const isSubmitting = getState("isSubmitting");

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input type="submit" disabled={isSubmitting} />
    </form>
  );
}

render(<App />, document.getElementById("root"));
