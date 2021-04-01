import { useForm } from "react-cool-form";
import { Outlet } from "react-router-dom";

const Wizard = () => {
  const { form } = useForm({
    shouldRemoveField: false,
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError :", errors)
  });

  return (
    <form ref={form} noValidate>
      <Outlet />
    </form>
  );
};

export default Wizard;
