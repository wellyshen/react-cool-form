import { forwardRef } from "react";
import { useForm } from "react-cool-form";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Select = forwardRef(({ label, id, children, error, ...rest }, ref) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <select id={id} ref={ref} {...rest}>
      {children}
    </select>
    {error && <p>{error}</p>}
  </div>
));

const Step2 = () => {
  const nav = useNavigate();
  const { state: formValues } = useLocation();
  const { form, mon, field, submit, getState } = useForm({
    // Fill in form values from other steps
    defaultValues: { sports: ["football"], ...formValues },
    // Pass form values to the next step
    onSubmit: (values) => nav("/step-3", { state: values })
  });
  const [errors, values] = mon(["errors", "values"], {
    errorWithTouched: true
  });

  return (
    <form ref={form} noValidate>
      <Select
        id="sports"
        label="Sports"
        name="sports"
        multiple
        ref={field((value) => {
          if (!value.length) return "Required";
          return value.length < 2 ? "Choose more" : false;
        })}
        error={errors.sports}
      >
        <option value="football">🏈</option>
        <option value="soccer">⚽️</option>
        <option value="basketball">🏀</option>
        <option value="baseball">⚾️</option>
        <option value="tennis">🎾</option>
        <option value="volleyball">🏐</option>
      </Select>
      <div className="btn">
        {/* Pass form values to the previous step */}
        <Link to="/" state={getState("values")}>
          Previous
        </Link>
        <button id="step-2" type="button" onClick={submit}>
          Next
        </button>
      </div>
      <pre>{JSON.stringify(values, undefined, 2)}</pre>
    </form>
  );
};

export default Step2;
