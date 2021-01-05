---
id: 3rd-party-ui-libraries
title: 3rd-Party UI Libraries
---

Life is hard but coding can be easier. The reason we ❤️ open-source software (OSS) is because there're many awesome libraries that help us making a better world by software products. React Cool Form bears the faith in mind, it allows us integrate with any 3rd-party UI libraries easily. There're three ways to integrate with an UI library in React Cool Form.

## 1. Seamless Integration

[Uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html) or components that rely on native input elements (i.e. [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)) to work under the hood, we need to do nothing 😂. For example: [Material-UI](https://material-ui.com)'s [TextField](https://material-ui.com/components/text-fields), [Checkbox](https://material-ui.com/components/checkboxes), and [Select](https://material-ui.com/components/selects) etc.

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

## 2. [Controller API](../api-reference/use-form#controller)

[Controlled components](https://reactjs.org/docs/forms.html#controlled-components) with highly customized and full features like [React Select](https://react-select.com) or [React Datepicker](https://reactdatepicker.com). We can use React Cool Form's [controller](../api-reference/use-form#controller) API for it.

[![Edit RCF - React Select](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-react-select-djsl1?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";
import Select from "react-select";

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

const App = () => {
  const { form, controller } = useForm({
    defaultValues: { framework: "" },
    onSubmit: (values) => alert(JSON.stringify(values, undefined, 2)),
  });

  return (
    <form ref={form}>
      <Select
        {...controller("framework", {
          // Parse the "option.value" and store it into the form's values
          // So the values will be: { framework: "react" }
          parse: ({ value }) => value,
          // react-select's value prop receives the "option" object
          // So we need to format it back
          format: (value) => options.find((option) => option.value === value),
        })}
        options={options}
        placeholder="I'm interesting in..."
      />
      <input type="submit" />
    </form>
  );
};
```

The `controller` will trigger re-renders whenever the value of the attached component updated. Re-renders are not bad but **slow re-renders** are. So, if you are building a complex form with large number of fields, you can create a reusable component to isolate re-rendering at the component level for better performance as below:

```js
import { memo, useState } from "react";
import { useForm } from "react-cool-form";
import Select from "react-select";

// We can use React.memo to skip re-rendering for the same props (especially for a heavy-computational component)
const Controller = memo(
  ({
    as,
    name,
    defaultValue,
    parse = () => {},
    format = () => {},
    onChange = () => {},
    onBlur = () => {},
    controller,
    ...rest
  }) => {
    const Component = as;
    // Don't forget to assign the default value
    const [value, setValue] = useState(defaultValue);

    return (
      <Component
        {...controller(name, {
          value,
          parse,
          format,
          onChange: (...args) => {
            // React Cool Form appends the field's value to the last parameter
            // We can use it to set the state
            const fieldValue = args.pop();
            setValue(fieldValue);
            // Pass the rest parameters to the callback
            onChange(...args);
          },
          onBlur,
        })}
        {...rest}
      />
    );
  }
);

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

const App = () => {
  const { form, controller } = useForm({
    defaultValues: { framework: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <Controller
        as={Select}
        name="framework"
        defaultValue=""
        options={options}
        parse={(option) => option.value}
        format={(value) => options.find((option) => option.value === value)}
        controller={controller}
      />
      <input type="submit" />
    </form>
  );
};
```

## 3. Do It Yourself

If the above solutions can't meet your needs then you can set up a custom field via the [API](../api-reference/use-form) of React Cool Form.

```js
import { useForm } from "react-cool-form";
import { TextField } from "@material-ui/core";

const App = () => {
  const { form, getState, setValue, validateField } = useForm({
    defaultValues: { username: "" },
    // ignoreFields: ["username"], // You can also ignore the field by this option
    validate: ({ username }) => {
      const errors = {};
      if (!username.length) errors.username = "Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [value, errors] = getState(["values.username", "errors"], {
    // Disable it to show the error at the right timing
    // Because the field isn't be touched without changing its value
    filterUntouchedError: false,
  });

  return (
    <form ref={form}>
      <TextField
        name="username" // Used for the "ignoreFields" option
        value={value}
        onChange={(e) => setValue("username", e.target.value)}
        onBlur={() => validateField("username")}
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-ignore": true }} // Ignore the field via the pre-defined data attribute
      />
    </form>
  );
};
```
