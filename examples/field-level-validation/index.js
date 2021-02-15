import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const validateOnServer = async (username) => {
  await new Promise((r) => setTimeout(r, 2000));
  return username === "Welly";
};

const validateEmail = (value) => {
  if (!value) {
    return "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return "Invalid email address";
  }
};

const validateUsername = async (value) => {
  if (!value) {
    return "Required";
  } else {
    const hasUser = await validateOnServer(value);
    if (!hasUser) return "User doesn't exist";
  }
};

function App() {
  const { form, field, select } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError: ", errors)
  });

  console.log("Form is validating: ", select("isValidating"));

  return (
    <form ref={form} noValidate>
      <input
        name="username"
        placeholder="Username"
        ref={field(validateUsername)}
      />
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
