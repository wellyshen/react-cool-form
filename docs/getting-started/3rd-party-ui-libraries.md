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
  const { form, select } = useForm({
    defaultValues: { username: "", framework: "", fruit: [] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const errors = select("errors");

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

## 2. [useControlled Hook](../api-reference/use-controlled)

[Controlled components](https://reactjs.org/docs/forms.html#controlled-components) with highly customized and full features like [React Select](https://react-select.com) or [React Datepicker](https://reactdatepicker.com). We can use React Cool Form's [useControlled](../api-reference/use-controlled) hook to create a reusable controller component for them in a flexible and performant way.

> 💡 We strongly advise to provide a default value for the controlled field.

[![Edit RCF - React Select](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-react-select-djsl1?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, useControlled } from "react-cool-form";
import Select from "react-select";

const Field = ({ as, name, ...restProps }) => {
  const [fieldProps] = useControlled(name, restProps);
  const Component = as;

  return <Component {...fieldProps} />;
};

const options = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

const App = () => {
  const { form, controller } = useForm({
    id: "form-1", // The ID is used by the "useControlled" hook
    defaultValues: { framework: "" }, // (Strongly advise) Provide a default value for the controlled field
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <Field
        as={Select}
        formId="form-1" // Provide the corresponding ID of the "useForm" hook
        name="framework"
        options={options}
        parse={(option) => option.value}
        format={(value) => options.find((option) => option.value === value)}
      />
      <input type="submit" />
    </form>
  );
};
```

## 3. Do It Yourself

If the above solutions can't meet your needs then you can set up a custom field with the [API](../api-reference/use-form#methods) of React Cool Form. The following example demonstrates how to combine the [useFormState](../api-reference/use-form-state) and [useFormMethods](../api-reference/use-form-methods) to DIY a custom field with full validation UX.

[![Edit RCF - Custom Field](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-custom-field-p9lqi?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, useFormState, useFormMethods } from "react-cool-form";
import { TextField } from "@material-ui/core";

const Field = ({ as, name, formId, onChange, onBlur, ...restProps }) => {
  const value = useFormState(`values.${name}`, { formId });
  const { setValue, setTouched } = useFormMethods(formId);
  const Component = as;

  return (
    <Component
      name={name}
      value={value}
      onChange={(e) => {
        setValue(name, e.target.value); // Update the field's value and set it as touched
        onChange(e);
      }}
      onBlur={(e) => {
        setTouched(name); // Set the field as touched for displaying error (if it's not touched)
        onBlur(e);
      }}
      {...restProps}
    />
  );
};

const App = () => {
  const { form, select } = useForm({
    defaultValues: { username: "" },
    // excludeFields: ["username"], // You can also exclude the field by this option
    validate: ({ username }) => {
      const errors = {};
      if (!username.length) errors.username = "Required";
      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const errors = select("errors");

  return (
    <form ref={form} noValidate>
      <Field
        as={TextField}
        label="Username"
        name="username" // Used for the "excludeFields" option
        required
        error={!!errors.username}
        helperText={errors.username}
        inputProps={{ "data-rcf-exclude": true }} // Exclude the field via the pre-defined data attribute
      />
      <input type="submit" />
    </form>
  );
};
```
