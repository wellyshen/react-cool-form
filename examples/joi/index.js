import { render } from "react-dom";
import { useForm, set } from "react-cool-form";
import Joi from "joi";

import "./styles.scss";

const schema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required().min(6)
});

const validate = (values) => {
  let errors = {};

  const { error: joiError } = schema.validate(values, { abortEarly: false });

  if (joiError)
    joiError.details.forEach(({ path, message }) =>
      set(errors, path[0], message)
    );

  return errors;
};

function App() {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validate,
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
