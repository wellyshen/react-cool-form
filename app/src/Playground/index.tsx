import { useForm, Parser, Formatter } from "react-cool-form";
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

const Playground = (): JSX.Element => {
  const { form, controller } = useForm<FormValues>({
    defaultValues: { age: "", slider: 0 },
    onSubmit: (values, e) => alert(JSON.stringify(values, undefined, 2)),
  });

  const formatter: Formatter<number, number> = (value) => value / 2;
  const parser: Parser<[Event, number], number> = (e, value) => value * 2;

  return (
    <form ref={form} noValidate>
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
      {/* <div>
        <Slider
          {...controller("slider", {
            format: formatter,
            parse: parser,
            onChange: (e, value) => console.log("LOG ===> onChange: ", value),
          })}
          aria-labelledby="continuous-slider"
        />
      </div> */}
      <input type="range" {...controller("slider")} />
      <input type="submit" />
    </form>
  );
};

export default Playground;
