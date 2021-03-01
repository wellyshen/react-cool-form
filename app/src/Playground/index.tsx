/* eslint-disable no-console */

import { useForm, useControlled } from "react-cool-form";
import Select from "react-select";

const Field = ({ as, name, ...restProps }: any) => {
  const [fieldProps] = useControlled(name, restProps);
  const Component = as;

  return <Component {...fieldProps} />;
};

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

export default () => {
  const { form } = useForm({
    id: "form-1", // The ID is used by the "useControlled" hook
    defaultValues: { framework: "" }, // (Strongly advise) Provide a default value for the controlled field
    excludeFields: ["#framework", ".framework"],
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input className="framework" />
      <Field
        as={Select}
        formId="form-1" // Provide the corresponding ID of the "useForm" hook
        name="framework"
        inputId="framework"
        options={options}
        parse={(option: any) => option.value}
        format={(value: any) =>
          options.find((option) => option.value === value)
        }
      />
      <input type="submit" />
    </form>
  );
};
