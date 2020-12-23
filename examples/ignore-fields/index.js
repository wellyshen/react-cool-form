import React, { useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "", option: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [showOptions, setShowOptions] = useState(false);

  return (
    <form ref={form} noValidate>
      <input name="username" />
      <input name="email" type="email" />
      <input
        name="toggle"
        type="checkbox"
        onChange={() => setShowOptions(!showOptions)}
        data-rcf-ignore
      />
      {showOptions && (
        <>
          <input name="option" type="radio" value="option-1" />
          <input name="option" type="radio" value="option-2" />
          <input name="option" type="radio" value="option-3" />
        </>
      )}
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
