import { memo, useState } from "react";
import { useForm } from "react-cool-form";
import Select from "react-select";

const Controller = memo(
  ({
    as,
    name,
    defaultValue,
    parse,
    format,
    onChange = () => null,
    onBlur = () => null,
    controller,
    ...rest
  }: any) => {
    const Component = as;
    const [value, setValue] = useState(defaultValue);

    return (
      <Component
        {...controller(name, {
          value,
          parse,
          format,
          onChange: (...args: any[]) => {
            const fieldValue = args.pop();
            setValue(fieldValue);
            onChange(...args);
          },
          onBlur,
        })}
        {...rest}
      />
    );
  }
);

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

export default () => {
  const { form, controller } = useForm({
    defaultValues: { framework: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Re-render!");

  return (
    <form ref={form}>
      <Controller
        as={Select}
        name="framework"
        defaultValue=""
        options={options}
        parse={(option: any) => option.value}
        format={(value: any) =>
          options.find((option) => option.value === value)
        }
        controller={controller}
      />
      <input type="submit" />
    </form>
  );
};
