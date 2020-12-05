import React from "react";
import { useForm } from "react-cool-form";

import "./styles.scss";

interface FormValues {
  name: string;
  email: string;
  password: string;
}

export default function App() {
  const { form, getState } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: (values) => alert(JSON.stringify(values)),
  });

  const errors = getState("errors");

  return (
    <form ref={form} noValidate>
      <div>
        <label>Name</label>
        <input name="name" required />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label>Email</label>
        <input name="email" type="email" required />
        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <label>Password</label>
        <input name="password" type="password" required minLength={8} />
        {errors.password && <p>{errors.password}</p>}
      </div>

      <input type="submit" />
      <input type="reset" />
    </form>
  );
}
