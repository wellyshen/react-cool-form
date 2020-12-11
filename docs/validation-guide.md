---
id: validation-guide
title: Validation Guide
---

React Cool Form supports a wide range of synchronous and asynchronous validation strategies for [built-in](#built-in-validation), [field-level](#field-level-validation), and [form-level](#form-level-validation) validations to cover all the cases that you need.

## Built-in Validation

We support [HTML5 form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#Using_built-in_form_validation) out of the box, a quick and easy way for form validation.

[![Edit RCF - Built-in validation](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-built-in-validation-1h28u?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={6}
      />
      <input type="submit" />
    </form>
  );
};
```

## Field-level Validation

Coming soon...

## Form-level Validation

Coming soon...

## Manually Triggering Validation

Coming soon...

## Displaying Error Messages

Coming soon...

## When Does Validation Run?

By default, React Cool Form runs validation methods as below, you can tell React Cool Form when to run validation by the [validateOnChange](./use-form) and/or [validateOnBlur](./use-form) depends on your needs.

| Event/method                  | Timing                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `onChange`                    | Whenever the value of a field has been changed.                                                                            |
| [`setFieldValue`](./use-form) | Whenever the value of a field has been set.                                                                                |
| [`setValues`](./use-form)     | Whenever the `values` of the [formState](#) as been set.                                                                   |
| `onBlur`                      | Whenever a field has been touched. **If a validation method has been run by the `onChange` event, it won't be run again**. |
| `onSubmit`                    | Whenever a submission attempt is made.                                                                                     |
| [`submit`](./use-form)        | Whenever a submission attempt is made manually.                                                                            |
| [`validateField`](./use-form) | Manually run field-level validation.                                                                                       |
| [`validateForm`](./use-form)  | Manually run form-level validation.                                                                                        |
