import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

let count = 0;

function App() {
  count++;

  const { form, use } = useForm({
    defaultValues: { firstName: "", lastName: "", framework: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const errors = use("errors");

  return (
    <form ref={form} noValidate>
      <div className="count">Render {count} times</div>
      <div>
        <input name="firstName" placeholder="First name" required />
        {errors.firstName && <p>{errors.firstName}</p>}
      </div>
      <div>
        <input name="lastName" placeholder="Last name" required />
        {errors.lastName && <p>{errors.lastName}</p>}
      </div>
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
