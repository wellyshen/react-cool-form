import { useForm } from "react-cool-form";

interface FormValues {
  t1: string;
  t2: string;
}

const defaultValues = {
  t1: "",
  t2: "",
};

const Playground = (): JSX.Element => {
  const { form, getState } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values, { formState, submit }) => {
      console.log("LOG ===> onSubmit", formState.submitCount);

      if (formState.submitCount < 5) submit();
    },
    onError: (errors, { formState }) => {
      console.log(
        "LOG ===> onError: ",
        getState("isSubmitting", { watch: false })
      );
    },
  });
  // console.log("LOG ===> getState: ", getState("isSubmitting"));

  return (
    <form ref={form} noValidate>
      <input name="t1" required />
      <input name="t2" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
