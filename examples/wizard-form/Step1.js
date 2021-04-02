import { useForm } from "react-cool-form";
import { useNavigate } from "react-router-dom";

const Field = ({ label, id, error, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

const Step1 = () => {
  const nav = useNavigate();
  const { form, mon, submit } = useForm({
    // Pass form values to the next step
    onSubmit: (values) => nav("/step-2", { state: values })
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
