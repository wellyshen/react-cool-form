import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { name: "", email: "" },
    onSubmit: (values) => alert(JSON.stringify(values)),
    onError: (errors) => console.log("onError: ", errors),
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
