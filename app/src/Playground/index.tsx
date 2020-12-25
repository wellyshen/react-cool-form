import { useEffect } from "react";
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
  const { form, getState, reset } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values) => console.log("LOG ===> onSubmit: ", values),
    onError: (errors) => console.log("LOG ===> onError: ", errors),
  });
  console.log("LOG ===> ", getState("dirtyFields"));

  useEffect(() => {
    reset({
      username: "new test",
      email: "new test",
    });
  }, [reset]);

  return (
    <form ref={form} noValidate>
      <Field id="username" name="username" placeholder="Username" />
      <Field id="email" name="email" type="email" placeholder="Email" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
