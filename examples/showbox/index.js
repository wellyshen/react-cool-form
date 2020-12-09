import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;
  const { form, getState } = useForm({
    defaultValues: { account: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values))
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <p className="count">Renders: {count}</p>
      <div>
        <input name="account" placeholder="Account" required />
        {errors.account && <p>{errors.account}</p>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
