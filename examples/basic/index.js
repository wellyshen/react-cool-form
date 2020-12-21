import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { username: "", framework: "", message: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <select name="framework">
        <option value="">I'm interesting in...</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>
      <textarea name="message" placeholder="Leave a message" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
