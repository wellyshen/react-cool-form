import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;
  const { form, getState } = useForm({
    defaultValues: { name: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values))
  });
  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <div className="count">Render {count} times</div>
      <div>
        <input name="name" placeholder="Name" required />
        {errors.name && <p>{errors.name}</p>}
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
      <div>
        <select name="plan">
          <option value="freemium">Freemium</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
