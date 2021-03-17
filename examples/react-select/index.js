import { render } from "react-dom";
import { useForm, useControlled } from "react-cool-form";
import Select from "react-select";

import "./styles.scss";

const Field = ({ as, name, ...restProps }) => {
  const [fieldProps] = useControlled(name, restProps);
  const Component = as;

  return <Component {...fieldProps} />;
};

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" }
];

function App() {
  const { form } = useForm({
    defaultValues: { framework: "" }, // We must provide a default value for the controlled field
    excludeFields: ["#framework"], // Exclude the internal input element of React-Select by ID
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <Field
        as={Select}
        name="framework"
        inputId="framework" // Used for excluding the internal input element of React-Select
        options={options}
        parse={(option) => option.value}
        format={(value) => options.find((option) => option.value === value)}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
