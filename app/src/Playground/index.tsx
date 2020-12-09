import { useForm } from "react-cool-form";

interface FormValues {
  text: string;
  color: string[];
}

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    defaultValues: { text: "", color: ["red"] },
    onSubmit: (values) => console.log(values),
  });

  return (
    <form ref={form} noValidate>
      <input name="text" />
      <select name="color">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </select>
      <input type="submit" />
    </form>
  );
};

export default Playground;
