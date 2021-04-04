import { useState } from "react";
import { useForm } from "react-cool-form";
import { useLocation, Link } from "react-router-dom";

const Checkbox = ({ id, label, ...rest }) => (
  <label htmlFor={id}>
    <input id={id} {...rest} /> {label}
  </label>
);

const Step2 = () => {
  const { state: formValues } = useLocation();
  const [toggle, setToggle] = useState(!!formValues?.fruit?.length);
  const { form, mon, getState } = useForm({
    // Fill in form values from other steps
    defaultValues: formValues || undefined,
    validate: ({ fruit }) =>
      fruit && !fruit.length ? { fruit: "Required" } : {},
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const [errors, values] = mon(["errors", "values"]);

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
            // Exclude the toggle from form values
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
        {/* Pass form values to the previous step */}
        <Link to="/step-2" state={getState("values")}>
          Previous
        </Link>
        <input type="submit" />
      </div>
      <pre>{JSON.stringify(values, undefined, 2)}</pre>
    </form>
  );
};

export default Step2;
