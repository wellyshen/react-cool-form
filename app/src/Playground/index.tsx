import { useForm } from "react-cool-form";
import { TextField } from "@material-ui/core";

export default () => {
  const { form, getState, setFieldValue, validateField } = useForm({
    defaultValues: { username: "" },
    validate: ({ username }) => {
      const errors = {};

      // @ts-expect-error
      if (!username.length) errors.username = "Required";

      console.log("LOG ===> ", errors);

      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [value, errors] = getState(["values.username", "errors"], {
    filterUntouchedError: false,
  });

  return (
    <form ref={form}>
      <TextField
        name="username" // Used for the "ignoreFields" option
        value={value}
        onChange={(e) => setFieldValue("username", e.target.value)}
        onBlur={() => validateField("username")}
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-ignore": true }} // Ignore the field via the pre-defined data attribute
      />
      <input type="submit" />
    </form>
  );
};
