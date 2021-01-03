import { memo, useCallback, useState } from "react";
import { useForm } from "react-cool-form";
// @ts-expect-error
import Select from "react-select";

interface FormValues {
  food: string;
}

const IsolatedSelect = memo(
  ({ name, defaultValue, controller, options, ...rest }: any) => {
    const [value, setValue] = useState(defaultValue);

    return (
      <Select
        {...controller(name, {
          value,
          parse: (option: any) => option.value,
          format: (val: any) =>
            options.find((option: any) => option.value === val),
          onChange: (e: any, val: any) => setValue(val),
        })}
        options={options}
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
      <IsolatedSelect
        name="food"
        controller={useCallback(controller, [controller])}
        defaultValue=""
        options={options}
      />
      <input type="submit" />
    </form>
  );
};

export default Playground;
