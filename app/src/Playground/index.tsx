import { useForm } from "react-cool-form";

interface FormValues {
  username: string;
  email: string;
}

const defaultValues = {
  username: "test",
  email: "test",
};

const Field = ({ label, id, ...rest }: any) => (
  <div>
    <input id={id} {...rest} />
    {label && <label htmlFor={id}>{label}</label>}
  </div>
);

const Playground = (): JSX.Element => {
  const { form, getState, setValues, setFieldValue } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit: ", values),
    onError: (errors) => console.log("LOG ===> onError: ", errors),
  });
  console.log("LOG ===> ", getState("values.username"));

  return (
    <form ref={form} noValidate>
      <Field id="username" name="username" placeholder="Username" />
      <Field id="email" name="email" type="email" placeholder="Email" />
      <input type="submit" />
      <button
        type="button"
        onClick={() => setFieldValue("username", defaultValues.username)}
      >
        Same Values
      </button>
      <button
        type="button"
        onClick={() =>
          setValues({
            username: "new test",
            email: "test",
          })
        }
      >
        Diff Values
      </button>
    </form>
  );
};

export default Playground;
