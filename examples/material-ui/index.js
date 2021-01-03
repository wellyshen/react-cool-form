import React from "react";
import { render } from "react-dom";
import { useForm } from "react-cool-form";
import {
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
  const { form, getState } = useForm({
    defaultValues: { username: "", framework: "", fruit: [], race: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2))
  });
  const errors = getState("errors");

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
        <Select inputProps={{ id: "framework", name: "framework" }} native>
          <option aria-label="None" value="I'm interesting in..." />
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="angular">Angular</option>
          <option value="svelte">Svelte</option>
        </Select>
      </FormControl>
      <FormControl component="fieldset"></FormControl>
      <div>
        <FormLabel component="legend">Fruit</FormLabel>
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
      </div>
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
