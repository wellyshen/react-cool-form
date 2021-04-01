import { useFormState, useFormMethods } from "react-cool-form";
import { useNavigate } from "react-router-dom";

import Field from "./Field";

const Step1 = () => {
  const nav = useNavigate();
  const { runValidation } = useFormMethods();
  const errors = useFormState("errors");

  const handleNextClick = async () => {
    // Validate and apply focus to the first field with an error
    const isValid = await runValidation(null, true);
    if (isValid) nav("step-2");
  };

  return (
    <>
      <Field
        id="first-name"
        label="First Name"
        name="firstName"
        required
        error={errors.firstName}
      />
      <Field
        id="last-name"
        label="Last Name"
        name="lastName"
        required
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
