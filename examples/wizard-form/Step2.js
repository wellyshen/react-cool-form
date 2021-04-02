import { useForm } from "react-cool-form";
import { useNavigate, Link } from "react-router-dom";

import Select from "./Select";

const Step2 = (props) => {
  console.log("LOG ===> ", props);
  const nav = useNavigate();
  const { form, mon, field, submit } = useForm({
    onSubmit: (values) => nav("/step-3", { state: { formValues: values } })
  });
  const errors = mon("errors", { errorWithTouched: true });

  return (
    <form ref={form} noValidate>
      <Select
        label="Sports"
        id="sports"
        name="sports"
        multiple
        ref={field((value) => (value.length < 2 ? "Choose more" : false))}
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
    </form>
  );
};

export default Step2;
