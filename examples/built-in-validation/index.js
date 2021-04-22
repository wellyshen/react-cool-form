import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError: ", errors)
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={8}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
