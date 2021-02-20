import { render } from "react-dom";
import { useForm, useFormState } from "react-cool-form";

import "./styles.scss";

const checkStrength = (pwd) => {
  const passed = [/[$@$!%*#?&]/, /[A-Z]/, /[0-9]/, /[a-z]/].reduce(
    (cal, test) => cal + test.test(pwd),
    0
  );

  return { 1: "weak", 2: "good", 3: "strong", 4: "very strong" }[passed];
};

const FieldMessage = () => {
  // Supports single-value-pick, array-pick, and object-pick data formats
  const [error, value] = useFormState(["errors.password", "values.password"], {
    formId: "form-1", // Provide the corresponding ID of "useForm" hook
    errorWithTouched: true,
  });

  return <p>{error || checkStrength(value)}</p>;
};

function App() {
  const { form } = useForm({
    id: "form-1", // The ID is used by the "useFormState" hook
    defaultValues: { password: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
  });

  return (
    <form ref={form} noValidate>
      <label htmlFor={id}>Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
      />
      <FieldMessage />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
