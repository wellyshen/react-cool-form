import { useFormState } from "react-cool-form";
import { Link } from "react-router-dom";

import Field from "./Field";

const Step2 = () => {
  // Show error message only when the field is touched
  const errors = useFormState("errors", { errorWithTouched: true });

  return (
    <>
      <Field
        id="email"
        label="Email"
        name="email"
        type="email"
        required
        error={errors.email}
      />
      <div className="btn">
        <Link to="/">Previous</Link>
        <input type="submit" />
      </div>
    </>
  );
};

export default Step2;
