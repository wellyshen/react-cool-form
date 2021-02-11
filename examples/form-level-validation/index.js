import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const validateOnServer = async (username) => {
  await new Promise((r) => setTimeout(r, 2000));
  return username === "Welly";
};

const validate = async ({ username, email }) => {
  const errors = {};

  if (!username) {
    errors.username = "Required";
  } else {
    const hasUser = await validateOnServer(username);
    if (!hasUser) errors.username = "User doesn't exist";
  }

  if (!email.length) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};

function App() {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "" },
    validate,
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError: ", errors)
  });

  console.log("Form is validating: ", getState("isValidating"));

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
