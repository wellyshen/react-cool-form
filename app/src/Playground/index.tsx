import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
  t2: string;
}

const defaultValues = {
  t1: "test",
  t2: "test",
};

const Playground = (): JSX.Element => {
  const { form, field, getState } = useForm<FormValues>({
    defaultValues,
    validate: async () => {
      // ...
    },
    onSubmit: (values) => console.log("LOG ===> onSubmit: ", values),
    onError: (errors) => console.log("LOG ===> onError: ", errors),
  });
  console.log("LOG ===> ", getState("isValidating"));

  return (
    <form ref={form} noValidate>
      <input
        name="t1"
        ref={field(() => {
          // eslint-disable-next-line compat/compat
          // await new Promise((r) => setTimeout(r, 3000));
        })}
      />
      <input
        name="t2"
        ref={field(async () => {
          // eslint-disable-next-line compat/compat
          await new Promise((r) => setTimeout(r, 3000));
        })}
      />
      <input type="submit" />
    </form>
  );
};

export default Playground;
