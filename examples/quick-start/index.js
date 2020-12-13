import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values))
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <div>
        <input name="username" placeholder="Username" required />
        {errors.username && <p>{errors.username}</p>}
      </div>
      <div>
        <input name="email" type="email" placeholder="Email" required />
        {errors.email && <p>{errors.email}</p>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
