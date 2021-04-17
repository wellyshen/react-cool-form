import { render } from "react-dom";
import { useForm } from "react-cool-form";
import {
  FormGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  TextField,
  Select,
  Checkbox,
  RadioGroup,
  Radio,
  Button
} from "@material-ui/core";

import "./styles.scss";

function App() {
  const { form, mon } = useForm({
    defaultValues: { username: "", framework: "", fruit: [], race: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const errors = mon("errors");

  return (
    <form ref={form} noValidate>
      <TextField
        label="Username"
        name="username"
        required
        error={!!errors.username}
        helperText={errors.username}
      />
      <FormControl>
        <InputLabel htmlFor="framework">Framework</InputLabel>
        {/* When working with select, we need to enable the native mon element or you can use the "NativeSelect" instead */}
        <Select inputProps={{ id: "framework", name: "framework" }} native>
          <option aria-label="None" value="" />
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="angular">Angular</option>
          <option value="svelte">Svelte</option>
        </Select>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Fruit</FormLabel>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox />}
            name="fruit"
            value="🍎"
            label="🍎"
          />
          <FormControlLabel
            control={<Checkbox />}
            name="fruit"
            value="🍋"
            label="🍋"
          />
          <FormControlLabel
            control={<Checkbox />}
            name="fruit"
            value="🥝"
            label="🥝"
          />
        </FormGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Race</FormLabel>
        <RadioGroup name="race" aria-label="race" row>
          <FormControlLabel control={<Radio />} value="🦸🏻‍♂️" label="🦸🏻‍♂️" />
          <FormControlLabel control={<Radio />} value="🧛🏻‍♂️" label="🧛🏻‍♂️" />
          <FormControlLabel control={<Radio />} value="🧝🏻‍♂️" label="🧝🏻‍♂️" />
        </RadioGroup>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
}

render(<App />, document.getElementById("root"));
