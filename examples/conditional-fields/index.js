import { useState } from "react";
import { render } from "react-dom";
import { useForm, useControlled } from "react-cool-form";

import "./styles.scss";

const RadioButtons = ({ name, buttons }) => {
  const [fieldProps] = useControlled(name, {
    defaultValue: buttons.filter(({ checked }) => checked)[0]?.value,
    type: "radio"
  });

  return buttons.map(({ id, value, checked }) => (
    <span key={id}>
      <input {...fieldProps} id={id} value={value} defaultChecked={checked} />
      <label htmlFor={id}>{value}</label>
    </span>
  ));
};

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "" },
    // excludeFields: ["more"], // You can also exclude the field here by passing in name/id/class
    // shouldRemoveField: false, // To maintain the state of the unmouned fields (default = true)
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
          name="more" // Used by the "excludeFields" option
          type="checkbox"
          onChange={() => setToggle(!toggle)}
          data-rcf-exclude // Exclude the fields via the pre-defined data attribute
        />
        <label htmlFor="more">More</label>
      </div>
      {toggle && (
        <>
          <input
            id="apple"
            name="fruit"
            type="radio"
            value="🍎"
            defaultChecked // Set default check (or value)
          />
          <label htmlFor="apple">🍎</label>
          <input id="kiwi" name="fruit" type="radio" value="🥝" />
          <label htmlFor="kiwi">🥝</label>
          <input id="lemon" name="fruit" type="radio" value="🍋" />
          <label htmlFor="lemon">🍋</label>
          {/* When working with conditional fields, please ensure the "useControlled" hook is wrapped in a component */}
          {/* <RadioButtons
            name="fruit"
            buttons={[
              { id: "apple", value: "🍎", checked: true },
              { id: "kiwi", value: "🥝" },
              { id: "lemon", value: "🍋" }
            ]}
          /> */}
        </>
      )}
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
