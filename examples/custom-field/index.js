import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";
import { TextField, Button } from "@material-ui/core";

import "./styles.scss";

function App() {
  const { form, getState, setValue, setTouched } = useForm({
    defaultValues: { username: "" },
    // excludeFields: ["username"], // You can also exclude the field by this option
    validate: ({ username }) => {
      const errors = {};
      if (!username.length) errors.username = "Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values)
  });
  const [value, errors] = getState(["values.username", "errors"]);

  return (
    <form ref={form} noValidate>
      <TextField
        label="Username"
        name="username" // Used for the "excludeFields" option
        value={value}
        required
        onChange={(e) => setValue("username", e.target.value)} // Update the field's value and set it as touched
        onBlur={() => setTouched("username")} // Set the field as touched for displaying error (if it's not touched)
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-exclude": true }} // Exclude the field via the pre-defined data attribute
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
}

render(<App />, document.getElementById("root"));
