import { render } from "react-dom";
import { useForm } from "react-cool-form";
import Select from "react-select";

import "./styles.scss";

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" }
];

function App() {
  const { form, controller } = useForm({
    // (Strongly advise) Provide a default value for the controlled field
    defaultValues: { framework: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <Select
        {...controller("framework", {
          // Parse the "option.value" and store it into the form's values
          // So the values will be: { framework: "react" }
          parse: ({ value }) => value,
          // react-select's value prop receives the "option" object
          // So we need to format it back
          format: (value) => options.find((option) => option.value === value)
        })}
        options={options}
        placeholder="I'm interesting in..."
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
