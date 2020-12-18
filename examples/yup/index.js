import React from "react";
import { render } from "react-dom";
import { useForm, set } from "react-cool-form";
import * as yup from "yup";

import "./styles.scss";

const schema = yup.object().shape({
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6)
});

const validate = async (values) => {
  let errors = {};

  try {
    await schema.validate(values, { abortEarly: false });
  } catch (yupError) {
    yupError.inner.forEach(({ path, message }) => set(errors, path, message));
  }

  return errors;
};

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validate,
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError: ", errors)
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
