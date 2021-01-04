import { useForm } from "react-cool-form";

export default () => {
  const { form, controller } = useForm({
    defaultValues: { test: "123" },
  });

  return (
    <form ref={form}>
      <input
        {...controller("test", {
          onChange: (e, v) => console.log("LOG ===> ", e, v),
        })}
      />
    </form>
  );
};
