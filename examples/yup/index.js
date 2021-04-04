import { render } from "react-dom";
import { useForm, set } from "react-cool-form";
import * as yup from "yup";
import Joi from "joi";

import "./styles.scss";

// Reusable validation function for Yup
const validateWithYup = (schema) => async (values) => {
  let errors = {};

  try {
    await schema.validate(values, { abortEarly: false });
  } catch (yupError) {
    yupError.inner.forEach(({ path, message }) => set(errors, path, message));
  }

  return errors;
};

// Reusable validation function for Joi
const validateWithJoi = (schema) => (values) => {
  let errors = {};

  const { error: joiError } = schema.validate(values, { abortEarly: false });

  if (joiError)
    joiError.details.forEach(({ path, message }) =>
      set(errors, path[0], message)
    );

  return errors;
};

const yupSchema = yup.object().shape({
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6)
});

const JoiSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required().min(6)
});

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validate: validateWithYup(yupSchema),
    // validate: validateWithJoi(JoiSchema),
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
    onError: (errors) => console.log("onError: ", errors)
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <input type="submit" />
    </form>
  );
}

render(<App />, document.getElementById("root"));
