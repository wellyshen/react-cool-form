import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form, getState } = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values))
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <div>
        <input name="name" placeholder="Name" required />
        {errors.name && <p>{errors.name}</p>}
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
          minLength={8}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      <input type="submit" />
      <input type="reset" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
