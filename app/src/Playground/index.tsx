import { useForm } from "react-cool-form";
import { TextField } from "@material-ui/core";

export default () => {
  const { form, getState, setValue, setTouched, submit } = useForm({
    defaultValues: { username: "" },
    validate: ({ username }) => {
      const errors = {};

      // @ts-expect-error
      if (!username.length) errors.username = "Required";
      // @ts-expect-error
      if (username.length < 3) errors.username = "Too Short";

      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [value, errors] = getState(["values.username", "errors"]);

  const handleSubmit = (e: any) => {
    setTouched("username");
    submit(e);
  };

  return (
    <form ref={form}>
      <TextField
        name="username" // Used for the "ignoreFields" option
        value={value}
        onChange={(e) => setValue("username", e.target.value)}
        onBlur={() => setTouched("username")}
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-ignore": true }} // Ignore the field via the pre-defined data attribute
      />
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
};
