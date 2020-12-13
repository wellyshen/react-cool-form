---
id: validation-guide
title: Validation Guide
---

React Cool Form supports a wide range of **synchronous** and **asynchronous** validation strategies for [built-in](#built-in-validation), [form-level](#form-level-validation), and [field-level](#field-level-validation) validation to cover all the cases that you need.

## Built-in Validation

We support [HTML form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#Using_built-in_form_validation) out of the box, a quick and easy way for form validation.

[![Edit RCF - Built-in validation](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-built-in-validation-1h28u?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" required />
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

Some validation attributes such as [minLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/minlength), [maxLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/maxlength), [min](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min), and [max](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max) are designed to validate a field once it has been edited by the user. If your validation relies on the [related methods](#manually-triggering-validation), use the [pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern) attribute or custom validation instead.

```js
<input name="password" required pattern=".{6,}" /> // 6 characters minimum
```

## Form-level Validation

It provides a convenient way to access the complete `values` of the form (a.k.a [formState.values](./form-state)), which is useful to validate dependent fields at the same time.

[![Edit RCF - Form-level validation](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-form-level-validation-2if7r?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

// Synchronous validation
const validate = (values, actions) => {
  const errors = {};

  if (!values.email.length) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  // ...

  return errors;
};

// Asynchronous validation
const validate = async (values, actions) => {
  const errors = {};
  const hasUser = await validateOnServer(values.username);

  if (!hasUser) errors.username = "User doesn't exist";

  // ...

  return errors;
};

const App = () => {
  const { form } = useForm({
    defaultValues: { username: "", email: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <input type="submit" />
    </form>
  );
};
```

In addition to write your own logic, it's also possible to use a 3rd-party library such as [Yup](https://github.com/jquense/yup), [Joi](https://github.com/sideway/joi), and many others with form-level validation. Let's take a look at the following example:

```js
import { useForm } from "react-cool-form";
import * as yup from "yup";

const validate = (values) => {
  // TODO: convert Yup errors to field errors
};

const App = () => {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <input type="submit" />
    </form>
  );
};
```

## Field-level Validation

Coming soon...

## When Does Validation Run?

By default, React Cool Form runs the above validation methods as below, you can tell React Cool Form when to run validation by the [validateOnChange](./use-form) and/or [validateOnBlur](./use-form) depends on your needs.

| Event/method                  | Timing                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `onChange`                    | Whenever the value of a field has been changed.                                                                            |
| [`setFieldValue`](./use-form) | Whenever the value of a field has been set.                                                                                |
| [`setValues`](./use-form)     | Whenever the `values` of the [formState](#) has been set.                                                                  |
| `onBlur`                      | Whenever a field has been touched. **If a validation method has been run by the `onChange` event, it won't be run again**. |
| `onSubmit`                    | Whenever a submission attempt is made.                                                                                     |
| [`submit`](./use-form)        | Whenever a submission attempt is made manually.                                                                            |
| [`validateField`](./use-form) | Manually run field-level validation.                                                                                       |
| [`validateForm`](./use-form)  | Manually run form-level validation.                                                                                        |

## Manually Triggering Validation

Coming soon...

## Displaying Error Messages

Coming soon...
