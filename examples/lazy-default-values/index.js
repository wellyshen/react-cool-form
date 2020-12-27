import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const Field = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
);

const Select = ({ label, id, children, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <select id={id} {...rest}>
      {children}
    </select>
  </div>
);

const Textarea = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} {...rest} />
  </div>
);

function App() {
  const { form } = useForm({
    defaultValues: { firstName: "", lastName: "", framework: "", message: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form} noValidate>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <Select label="Framework" id="framework" name="framework">
        <option value="">I'm interesting in...</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </Select>
      <Textarea label="Message" id="message" name="message" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
