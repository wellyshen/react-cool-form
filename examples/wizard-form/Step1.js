import { useForm } from "react-cool-form";
import { useNavigate } from "react-router-dom";

import Field from "./Field";

const Step1 = () => {
  const { form, mon, submit } = useForm({
    onSubmit: (values) => nav("/step-2", { state: values })
  });
  const nav = useNavigate();
  // Show error message only when the field is touched
  const errors = mon("errors", { errorWithTouched: true });

  return (
    <form ref={form} noValidate>
      <Field id="name" label="Name" name="name" required error={errors.name} />
      <Field
        id="email"
        label="Email"
        name="email"
        type="email"
        required
        error={errors.email}
      />
      <div className="btn">
        <button type="button" onClick={submit}>
          Next
        </button>
      </div>
    </form>
  );
};

export default Step1;
