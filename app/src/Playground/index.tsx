import { memo, useState } from "react";
import { useForm } from "react-cool-form";
// @ts-expect-error
import Select from "react-select";

interface FormValues {
  food: string;
}

const Optimizer = memo(
  ({ as, name, defaultValue, parse, format, controller, ...rest }: any) => {
    const Component = as;
    const [value, setValue] = useState(defaultValue);

    return (
      <Component
        {...controller(name, {
          value,
          parse,
          format,
          onChange: (e: any, val: any) => setValue(val),
        })}
        {...rest}
      />
    );
  }
);

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const Playground = (): JSX.Element => {
  const { form, controller } = useForm<FormValues>({
    defaultValues: { food: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  console.log("LOG ===> Re-renders");

  return (
    <form ref={form} noValidate>
      <Optimizer
        as={Select}
        name="food"
        defaultValue=""
        options={options}
        parse={(option: any) => option.value}
        format={(value: any) =>
          options.find((option: any) => option.value === value)
        }
        controller={controller}
      />
      <input type="submit" />
    </form>
  );
};

export default Playground;
