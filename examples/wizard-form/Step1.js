import { useFormState, useFormMethods } from "react-cool-form";
import { useNavigate } from "react-router-dom";

import Field from "./Field";

const Step1 = () => {
  const nav = useNavigate();
  const { runValidation, field } = useFormMethods();
  const errors = useFormState("errors");

  const handleNextClick = async () => {
    const isValid = await runValidation();
    if (isValid) nav("step-2");
  };

  return (
    <>
      <Field
        id="first-name"
        label="First Name"
        name="firstName"
        required // Use built-in validation
        error={errors.firstName}
      />
      <Field
        id="last-name"
        label="Last Name"
        name="lastName"
        // Use field-level validation
        ref={field((value) => (!value.length ? "Required" : false))}
        error={errors.lastName}
      />
      <div className="btn">
        <button type="button" onClick={handleNextClick}>
          Next
        </button>
      </div>
    </>
  );
};

export default Step1;
