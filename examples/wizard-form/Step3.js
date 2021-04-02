import { useForm } from "react-cool-form";
import { Link } from "react-router-dom";

const Step2 = ({ formValues }) => {
  const { form } = useForm({
    onSubmit: (values) => console.log("LOG ===> ", { ...formValues, values })
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
