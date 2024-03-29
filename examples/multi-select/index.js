import { render } from "react-dom";
import { useForm } from "react-cool-form";

import "./styles.scss";

function App() {
  const { form } = useForm({
    defaultValues: { frameworks: ["react"] },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <label htmlFor="frameworks">Frameworks</label>
      <select id="frameworks" name="frameworks" multiple>
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
