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
    id: "form-1", // The ID is used by the "useControlled" hook
    defaultValues: { framework: "" }, // (Strongly advise) Provide a default value for the controlled field
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });

  return (
    <form ref={form}>
      <Field
        as={Select}
        formId="form-1" // Provide the corresponding ID of the "useForm" hook
        name="framework"
        options={options}
        parse={(option) => option.value}
        format={(value) => options.find((option) => option.value === value)}
      />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
