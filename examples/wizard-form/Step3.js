import { useForm } from "react-cool-form";
import { useLocation, Link } from "react-router-dom";

const Step2 = () => {
  const { state } = useLocation();
  const { form } = useForm({
    onSubmit: (values) =>
      alert(JSON.stringify({ ...state, ...values }, undefined, 2))
  });

  return (
    <form ref={form} noValidate>
      <div className="btn">
        <Link to="/step-2">Previous</Link>
        <input type="submit" />
      </div>
    </form>
  );
};

export default Step2;
