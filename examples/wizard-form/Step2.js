import { forwardRef } from "react";
import { useForm } from "react-cool-form";
import { useNavigate, Link } from "react-router-dom";

import { useFormValues } from "./formValues";

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
  const [formValues, setFormValues] = useFormValues();
  const nav = useNavigate();
  const { form, mon, field, submit } = useForm({
    // Fill in form values from context
    defaultValues: { sports: ["football"], ...formValues },
    // Pass form values for other steps via context
    onSubmit: (values) => {
      setFormValues(values);
      nav("/step-3");
    }
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
        <Link to="/">Previous</Link>
        <button id="step-2" type="button" onClick={submit}>
          Next
        </button>
      </div>
      <pre>{JSON.stringify(values, undefined, 2)}</pre>
    </form>
  );
};

export default Step2;
