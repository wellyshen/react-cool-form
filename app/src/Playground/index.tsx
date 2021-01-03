import { useForm } from "react-cool-form";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

interface FormValues {
  firstName: string;
  lastName: string;
}

const defaultValues = {
  firstName: "",
  lastName: "",
};

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

const Playground = (): JSX.Element => {
  const classes = useStyles();
  const { form } = useForm<FormValues>({
    defaultValues,
    onSubmit: (values, e) => alert(JSON.stringify(values, undefined, 2)),
  });

  return (
    <form ref={form} className={classes.root} noValidate>
      <TextField name="firstName" />
      <TextField name="lastName" />
      <input type="submit" />
    </form>
  );
};

export default Playground;
