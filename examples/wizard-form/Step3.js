import { useState } from "react";
import { useForm } from "react-cool-form";
import { useLocation, Link } from "react-router-dom";

const Checkbox = ({ id, label, ...rest }) => (
  <label htmlFor={id}>
    <input id={id} {...rest} /> {label}
  </label>
);

const Step2 = () => {
  const [toggle, setToggle] = useState(false);
  const { state: prevValues } = useLocation();
  const { form, mon } = useForm({
    validate: ({ fruit }) => {
      return fruit && !fruit.length ? { fruit: "Required" } : {};
    },
    onSubmit: (values) =>
      alert(JSON.stringify({ ...prevValues, ...values }, 0, 2))
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
            data-rcf-exclude
            onClick={() => setToggle(!toggle)}
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
      <pre>{JSON.stringify({ ...prevValues, ...values }, 0, 2)}</pre>
    </form>
  );
};

export default Step2;
