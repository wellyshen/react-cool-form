import { useForm, Parser } from "react-cool-form";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControl,
  InputLabel,
  NativeSelect,
  Slider,
} from "@material-ui/core";

interface FormValues {
  age: any;
  slider: any;
}

const useStyles = makeStyles({
  root: {
    width: 200,
  },
});

const Playground = (): JSX.Element => {
  const classes = useStyles();
  const { form, controller } = useForm<FormValues>({
    defaultValues: { age: "", slider: 0 },
    onSubmit: (values, e) => alert(JSON.stringify(values, undefined, 2)),
  });

  const parser: Parser<[Event, number], number> = (e, value) => value;

  return (
    <form ref={form} noValidate className={classes.root}>
      {/* <div>
        <FormControl>
          <InputLabel id="age-native-helper">Age</InputLabel>
          <NativeSelect
            inputProps={{
              name: "age",
              id: "age-native-helper",
            }}
          >
            <option aria-label="None" value="" />
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </NativeSelect>
        </FormControl>
      </div> */}
      <div>
        <Slider
          {...controller("slider", {
            parse: parser,
            // onChange: (e, value) => console.log("LOG ===> onChange: ", e),
          })}
          aria-labelledby="continuous-slider"
        />
      </div>
      <input type="submit" />
    </form>
  );
};

export default Playground;
