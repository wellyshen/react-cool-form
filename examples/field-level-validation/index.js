import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const validateOnServer = async (username) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return username !== "joker";
};

const validateEmail = (value) => {
  if (!value) {
    return "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return "Invalid email address";
  }
};

const validateName = async (value) => {
  if (!value) {
    return "Required";
  } else {
    const hasUser = await validateOnServer(username);
    if (!hasUser) return "User doesn't exist";
  }
};

function App() {
  const { form, field } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: (values) => alert(JSON.stringify(values)),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" ref={field(validateName)} />
      <input
        name="email"
        type="email"
        placeholder="Email"
        ref={field(validateEmail)}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
