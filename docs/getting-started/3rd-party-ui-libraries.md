---
id: 3rd-party-ui-libraries
title: 3rd-Party UI Libraries
---

Life is hard but coding can be easier. The reason we ❤️ open-source software (OSS) is because there're many awesome libraries that help us making a better world by software products. React Cool Form bears the faith in mind, it allows us integrate with any 3rd-party UI libraries easily. There're three ways to integrate with an UI library in React Cool Form.

## Seamless Integration

A component that can be [uncontrolled](https://reactjs.org/docs/uncontrolled-components.html) or relies on native input elements (i.e. [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)) to work under the hood, we need to do nothing 😂. For example: [Material-UI](https://material-ui.com)'s [TextField](https://material-ui.com/components/text-fields), [Checkbox](https://material-ui.com/components/checkboxes), and [Select](https://material-ui.com/components/selects) etc.

[![Edit RCF - Material-UI](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-material-ui-xyi0b?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  TextField,
  Select,
  Checkbox,
  Button,
} from "@material-ui/core";

const App = () => {
  const { form, getState } = useForm({
    defaultValues: { username: "", framework: "", fruit: [] },
    onSubmit: (values) => console.log("onSubmit: ", values),
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
        {/* When working with select, we need to enable the native select element or you can use the "NativeSelect" instead */}
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
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};
```
