import { useForm } from "react-cool-form";

export default () => {
  const { form } = useForm({
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <input name="foo" type="checkbox" value="1" />
      <input name="bar" type="radio" value="1" />
      <select name="baz" multiple>
        <option>1</option>
        <option>1</option>
      </select>
      <input type="submit" />
    </form>
  );
};
