import { useForm } from "react-cool-form";
import { TextField } from "@material-ui/core";

export default () => {
  const { form, getState, setValue, setTouched, submit } = useForm({
    defaultValues: { username: "" },
    // ignoreFields: ["username"], // You can also ignore the field by this option
    validate: ({ username }) => {
      const errors = {};
      // @ts-expect-error
      if (!username.length) errors.username = "Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [value, errors] = getState(["values.username", "errors"]);

  return (
    <form ref={form}>
      <TextField
        name="username" // Used for the "ignoreFields" option
        value={value}
        onChange={(e) => setValue("username", e.target.value)} // Update the field's value and set it as touched
        onBlur={() => setTouched("username")} // Set the field as touched for displaying error (if it's not touched)
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-ignore": true }} // Ignore the field via the pre-defined data attribute
      />
      <input type="submit" />
    </form>
  );
};
