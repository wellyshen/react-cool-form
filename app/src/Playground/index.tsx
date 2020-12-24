import { useState } from "react";
import { useForm } from "react-cool-form";

interface FormValues {
  username: string;
  email: string;
  option?: string;
  other?: string;
}

const defaultValues = {
  username: "",
  email: "",
  option: "opt-2",
  // other: "form test",
};

const Field = ({ label, id, ...rest }: any) => (
  <div>
    <input id={id} {...rest} />
    {label && <label htmlFor={id}>{label}</label>}
  </div>
);

const Playground = (): JSX.Element => {
  const { form } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit: ", values),
    onError: (errors) => console.log("LOG ===> onError: ", errors),
  });
  const [toggle, setToggle] = useState(false);

  return (
    <form ref={form} noValidate>
      <Field id="username" name="username" placeholder="Username" />
      <Field id="email" name="email" type="email" placeholder="Email" />
      <Field
        id="options"
        name="options"
        type="checkbox"
        label="Options"
        onChange={() => setToggle(!toggle)}
      />
      {toggle && (
        <>
          <Field name="other" defaultValue="field test" />
          <Field
            id="option"
            name="option"
            type="radio"
            value="opt-1"
            label="opt-1"
          />
          <Field
            id="option"
            name="option"
            type="radio"
            value="opt-2"
            label="opt-2"
          />
        </>
      )}
      <input type="submit" />
    </form>
  );
};

export default Playground;
