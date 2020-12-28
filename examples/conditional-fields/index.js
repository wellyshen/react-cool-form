import React, { useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "" },
    // ignoreFields: ["more"], // You can also ignore the fields by this option
    // removeUnmountedField: false, // To maintain the state of the unmouned fields (default = true)
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [toggle, setToggle] = useState(false);

  return (
    <form ref={form}>
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
        <label htmlFor="more">More</label>
      </div>
      {toggle && (
        <>
          <input
            id="apple"
            name="option"
            type="radio"
            value="🍎"
            defaultChecked // Set default check (or value)
          />
          <label htmlFor="apple">🍎</label>
          <input id="kiwi" name="option" type="radio" value="🥝" />
          <label htmlFor="kiwi">🥝</label>
          <input id="lemon" name="option" type="radio" value="🍋" />
          <label htmlFor="lemon">🍋</label>
        </>
      )}
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
