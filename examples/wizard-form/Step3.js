import { useState } from "react";
import { useForm } from "react-cool-form";
import { Link } from "react-router-dom";

import { useFormValues } from "./formValues";

const Checkbox = ({ id, label, ...rest }) => (
  <label htmlFor={id}>
    <input id={id} {...rest} /> {label}
  </label>
);

const Step3 = () => {
  const [formValues, setFormValues] = useFormValues();
  const [toggle, setToggle] = useState(!!formValues?.fruit?.length);
  const { form, use } = useForm({
    // Fill in form values from context
    defaultValues: formValues,
    validate: ({ fruit }) =>
      fruit && !fruit.length ? { fruit: "Required" } : {},
    onSubmit: (values) => {
      // Pass form values for other steps via context
      setFormValues(values);
      alert(JSON.stringify(values, undefined, 2));
    }
  });
  const [errors, values] = use(["errors", "values"]);

  return (
    <form ref={form} noValidate>
      <div>
        <label htmlFor="fruit">
          Fruit{" "}
          <input
            id="fruit"
            type="checkbox"
            defaultChecked={toggle}
            onClick={() => setToggle(!toggle)}
            // Exclude the toggler from form values
            data-rcf-exclude
          />
        </label>
      </div>
      {toggle && (
        <div className="fruit">
          <Checkbox
            id="apple"
            label="🍎"
            name="fruit"
            type="checkbox"
            value="apple"
          />
          <Checkbox
            id="lemon"
            label="🍋"
            name="fruit"
            type="checkbox"
            value="lemon"
          />
          <Checkbox
            id="watermelon"
            label="🍉"
            name="fruit"
            type="checkbox"
            value="watermelon"
          />
          <Checkbox
            id="cherry"
            label="🍒"
            name="fruit"
            type="checkbox"
            value="cherry"
          />
        </div>
      )}
      {errors.fruit && <p>{errors.fruit}</p>}
      <div className="btn">
        <Link to="/step-2">Previous</Link>
        <input type="submit" />
      </div>
      <pre>{JSON.stringify(values, undefined, 2)}</pre>
    </form>
  );
};

export default Step3;
