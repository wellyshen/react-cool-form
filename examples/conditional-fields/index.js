import React, { useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "" },
    // ignoreFields: ["more"], // You can also ignore the fields via the option
    // removeUnmountedField: false // To preserve the data of the unmouned fields (default = true)
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [toggle, setToggle] = useState(false);

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <div>
        <input
          id="more"
          name="more" // We don't need to set it when the fields are ignored via data attribute
          type="checkbox"
          onChange={() => setToggle(!toggle)}
          data-rcf-ignore // Ignore the fields via the pre-defined data attribute
        />
        <label htmlForm="more">More</label>
      </div>
      {toggle && (
        <>
          <input
            id="apple"
            name="option"
            type="radio"
            value="🍎"
            defaultChecked
          />
          <label htmlForm="apple">🍎</label>
          <input id="kiwi" name="option" type="radio" value="🥝" />
          <label htmlForm="kiwi">🥝</label>
          <input id="lemon" name="option" type="radio" value="🍋" />
          <label htmlForm="lemon">🍋</label>
        </>
      )}
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
