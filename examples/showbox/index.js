import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;
  const { form } = useForm({
    defaultValues: { firstName: "", lastName: "", framework: "" },
    onSubmit: (values) => alert(JSON.stringify(values))
  });

  return (
    <form ref={form} noValidate>
      <div className="count">Render {count} times</div>
      <input name="firstName" placeholder="First name" />
      <input name="lastName" placeholder="Last name" />
      <select name="framework">
        <option value="">I'm interesting in...</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
