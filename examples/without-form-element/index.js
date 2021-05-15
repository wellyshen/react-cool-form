import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

const Field = ({ label, id, error, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

function App() {
  const { form, use, submit } = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const errors = use("errors", { errorWithTouched: true });

  return (
    <div ref={form}>
      <Field
        label="Email"
        id="email"
        name="email"
        type="email"
        required
        error={errors.email}
      />
      <Field
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        error={errors.password}
      />
      <button onClick={submit}>Submit</button>
    </div>
  );
}

render(<App />, document.getElementById("root"));
