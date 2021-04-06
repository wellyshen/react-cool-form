import { useForm } from "react-cool-form";
import { useNavigate } from "react-router-dom";

import { useFormValues } from "./formValues";

const Field = ({ label, id, error, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

const Step1 = () => {
  const [formValues, setFormValues] = useFormValues();
  const nav = useNavigate();
  const { form, mon, submit } = useForm({
    // Fill in form values from context
    defaultValues: formValues,
    // Pass form values for other steps via conext
    onSubmit: (values) => {
      setFormValues(values);
      nav("/step-2");
    }
  });
  // Show error message only when the field is touched
  const [errors, values] = mon(["errors", "values"], {
    errorWithTouched: true
  });

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
      <pre>{JSON.stringify(values, undefined, 2)}</pre>
    </form>
  );
};

export default Step1;
