---
id: validation-guide
title: Validation Guide
slug: /validation-guide
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

Some validation attributes such as [minLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/minlength), [maxLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/maxlength), [min](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min), and [max](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max) are designed to validate a field once it has been edited by the user. Therefore when [manually trigger](#manually-triggering-validation) these validations, use the [pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern) attribute or custom validation instead.

```js
<input name="password" type="password" required pattern=".{6,}" /> // 6 characters minimum
```

## Form-level Validation

The [validate](./use-form#validate) option provides a convenient way to access the complete `values` of the form (a.k.a [formState.values](./form-state)), which is useful to validate dependent fields at the same time.

> 💡 Please ensure the shape of the `errors` matches the shape of form's `values`. If you're dealing with [complex form data](./complex-form-data), we've provided a set of [utility functions](./api-reference/utility-functions) to help you get shit done 💩.

[![Edit RCF - Form-level validation](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-form-level-validation-2if7r?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

// Synchronous validation
const validate = (values) => {
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
const validate = async (values) => {
  const errors = {};
  const hasUser = await validateOnServer(values.username);

  if (!hasUser) errors.username = "User doesn't exist";

  // ...

  return errors;
};

const App = () => {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  console.log("Form is validating: ", getState("isValidating"));

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

[![Edit RCF - Yup](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-yup-lsk6f?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, set } from "react-cool-form";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
});

const validate = async (values) => {
  let errors = {};

  try {
    await schema.validate(values, { abortEarly: false });
  } catch (yupError) {
    // Convert the yup errors to field errors
    // Use the "set" helper to assign properties for both "shallow" and "deep" (nested fields) object
    yupError.inner.forEach(({ path, message }) => set(errors, path, message));
  }

  return errors;
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

👀 Looking for the example of Joi? Right [here](https://codesandbox.io/s/rcf-joi-yjbus).

## Field-level Validation

React Cool Form provides the [field](./use-form#field) method for field-level validation. Simply register your validator via the `ref` attribute of a field like the following example:

[![Edit RCF - Field-level validation](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-field-level-validation-dbklg?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

// Synchronous validation
const validateEmail = (value, values /* Form values */) => {
  if (!value) {
    return "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return "Invalid email address";
  }
};

// Asynchronous validation
const validateUsername = async (values, values /* Form values */) => {
  const hasUser = await validateOnServer(values);
  if (!hasUser) return "User doesn't exist";
};

const App = () => {
  const { form, field, getState } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  console.log("Form is validating: ", getState("isValidating"));

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Name" ref={field(validateUsername)} />
      <input
        name="email"
        type="email"
        placeholder="Email"
        ref={field(validateEmail)}
      />
      <input type="submit" />
    </form>
  );
};
```

The `field` method can not only be used for validating but also for converting data type. When they are used together, just tweak the code as below:

```js
<input
  name="username"
  ref={field({
    validate: validateUsername,
    valueAsNumber: true,
    // More options...
  })}
/>
```

## Manually Triggering Validation

We can manually trigger built-in, field-level, and form-level validation with the [`validateField`](./use-form#validateField) and [`validateForm`](./use-form#validateForm) methods respectively. Here I take form-level as an example:

```js
import { useForm } from "react-cool-form";

const validate = (values) => {
  const errors = {};

  // To validate a single field, the property of the "errors" should reflect the name of the dependent field
  if (!values.username.length) errors.username = "Required";

  if (!values.email.length) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};

const App = () => {
  const { form, validateField, validateForm } = useForm({
    defaultValues: { username: "", email: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      {/* Validate a single field */}
      <button onClick={() => validateField("username")}>
        Validate Username
      </button>
      {/* Validate the form */}
      <button onClick={() => validateForm()}>Validate All</button>
      {/* Check validate results */}
      <button
        onClick={async () => {
          const errors = await validateForm();
          if (errors) {
            console.log("🙅🏻‍♀ Invalid");
          } else {
            console.log("🙆🏻‍♀️ Valid");
          }
        }}
      >
        Validate Results
      </button>
      <input type="submit" />
    </form>
  );
};
```

## When/How Does Validation Run?

By default, React Cool Form runs all the validation methods as follows. You can tell React Cool Form when to run validation by changing the [validateOnChange](./use-form#validateOnChange) and/or [validateOnBlur](./use-form#validateOnBlur) depends on your needs.

### When to Run

| Event/method                                | Target     | Timing                                                                                                                     |
| ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `onChange`                                  | Individual | Whenever the value of a field has been changed.                                                                            |
| [`setFieldValue`](./use-form#setFieldValue) | Individual | Whenever the value of a field has been set.                                                                                |
| [`setValues`](./use-form#setValues)         | All        | Whenever the `values` of the [formState](./form-state) has been set.                                                       |
| `onBlur`                                    | Individual | Whenever a field has been touched. **If a validation method has been run by the `onChange` event, it won't be run again**. |
| `onSubmit`                                  | All        | Whenever a submission attempt is made.                                                                                     |
| [`submit`](./use-form#submit)               | All        | Whenever a submission attempt is made manually.                                                                            |
| [`validateField`](./use-form#validateField) | Individual | Manually run validation for a single field.                                                                                |
| [`validateForm`](./use-form#validateForm)   | All        | Manually run validation for the form.                                                                                      |

### How to Run

When validating with mixed ways, the results are deeply merged according to the following order:

1. Built-in validation
2. Field-level validation
3. Form-level validation

> 💡 To make the validation result of each field works correctly via the [individual](#when-to-run) target event or method. When using [form-level validation](#form-level-validation), please ensure the shape of the `errors` matches the form's `values`.

## Displaying Error Messages

All errors are stored in the [formState.errors](./form-state), we can display error messages by accessing the `errors` object via the [getState](./api-reference/use-form) method. The `getState` method is designed to filter the errors of untouched fields by default, which based on the [Errors in Forms design guideline](https://www.nngroup.com/articles/errors-forms-design-guidelines) (No.7). You can disable the feature by setting the `filterUntouchedError` option to `false`.

[![Edit RCF - Quick start](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-quick-start-j8p1l?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // By default, the errors of untouched fields are filtered out, which helps the user focus on typing without being annoying
  // You can disable this feature by setting the "filterUntouchedError" option to false
  const errors = getState("errors", { filterUntouchedError: true });

  return (
    <form ref={form} noValidate>
      <div>
        <input name="username" placeholder="Username" required />
        {errors.username && <p>{errors.username}</p>}
      </div>
      <div>
        <input name="email" type="email" placeholder="Email" required />
        {errors.email && <p>{errors.email}</p>}
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      <input type="submit" />
    </form>
  );
};
```
