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
      <input name="username" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required minLength={8} />
      <input type="submit" />
    </form>
  );
};
```

Some validation attributes such as [minLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/minlength), [maxLength](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/maxlength), [min](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min), and [max](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max) are designed to validate a field once it has been edited by the user. Therefore when [manually triggering](#manually-triggering-validation) these validations, use the [pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern) attribute or custom validation instead.

```js
<input name="password" type="password" required pattern=".{6,}" /> // 6 characters minimum
```

## Form-level Validation

The [validate](../api-reference/use-form#validate) option provides a convenient way to access the complete `values` of the form (a.k.a [formState.values](./form-state#about-the-form-state)), which is useful to validate by dependent fields **during both editing (e.g. onChange, onBlur) and submission phases**.

:::note
Please ensure the shape of the `errors` matches the shape of form's `values`. If you're dealing with [complex structures](./complex-structures), we've provided a set of [utility functions](../api-reference/utility-functions) to help you get shit done 💩.
:::

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
  const { form, mon } = useForm({
    defaultValues: { username: "", email: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  console.log("Form is validating: ", mon("isValidating"));

  return (
    <form ref={form} noValidate>
      <input name="username" />
      <input name="email" type="email" />
      <input type="submit" />
    </form>
  );
};
```

In addition to write your own logic, it's also possible to run form-level validation with any 3rd-party libraries (e.g. [Yup](https://github.com/jquense/yup), [Joi](https://github.com/sideway/joi), and many others). Let's see how to make it by the following example:

[![Edit RCF - Schema](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-schema-lsk6f?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, set } from "react-cool-form";
import * as yup from "yup";
import Joi from "joi";

// Reusable validation function for Yup
const validateWithYup = (schema) => async (values) => {
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

// Reusable validation function for Joi
const validateWithJoi = (schema) => (values) => {
  let errors = {};

  const { error: joiError } = schema.validate(values, { abortEarly: false });

  if (joiError)
    joiError.details.forEach(({ path, message }) =>
      set(errors, path[0], message)
    );

  return errors;
};

const yupSchema = yup.object().shape({
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
});

const JoiSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required().min(6),
});

const App = () => {
  const { form } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validate: validateWithYup(yupSchema),
    // validate: validateWithJoi(JoiSchema),
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="username" />
      <input name="email" type="email" />
      <input name="password" type="password" />
      <input type="submit" />
    </form>
  );
};
```

## Field-level Validation

React Cool Form provides the [field](../api-reference/use-form#field) method for field-level validation. We can also access the form `values` with the method to validate by dependent fields **during the submission phase**. Simply register your validator via the `ref` attribute of a field like the following example:

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
const validateUsername = async (value, values /* Form values */) => {
  const hasUser = await validateOnServer(value);
  if (!hasUser) return "User doesn't exist";
};

const App = () => {
  const { form, field, mon } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  console.log("Form is validating: ", mon("isValidating"));

  return (
    <form ref={form} noValidate>
      <input name="username" ref={field(validateUsername)} />
      <input name="email" type="email" ref={field(validateEmail)} />
      <input type="submit" />
    </form>
  );
};
```

The `field` method can not only be used for validating but also converting data type. When they are used together, just tweak the code as below:

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

We can manually trigger built-in, field-level, and form-level validation with React Cool Form's [`runValidation`](../api-reference/use-form#runvalidation) method.

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
  const { form, runValidation } = useForm({
    defaultValues: { firstName: "", lastName: "", email: "" },
    validate,
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });

  return (
    <form ref={form} noValidate>
      <input name="firstName" required />
      <input name="lastName" required />
      <input name="email" type="email" required />
      {/* Validate single field */}
      <button onClick={() => runValidation("firstName")}>
        Validate Single
      </button>
      {/* Validate multiple fields */}
      <button onClick={() => runValidation(["firstName", "lastName"])}>
        Validate Multiple
      </button>
      {/* Validate the form (i.e. all the fields) */}
      <button onClick={() => runValidation()}>Validate All</button>
      {/* With result */}
      <button
        onClick={async () => {
          const isValid = await runValidation();
          console.log("The form is: ", isValid ? "valid" : "invalid");
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

By default, React Cool Form runs all the validation methods as follows. You can tell React Cool Form when to run them by changing the [validateOnChange](../api-reference/use-form#validateonchange) and/or [validateOnBlur](../api-reference/use-form#validateonblur) depends on your needs.

### When to Run

| Event/method                                               | Target         | Timing                                                                                                                     |
| ---------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `onChange`                                                 | Individual     | Whenever the value of a field has been changed.                                                                            |
| [`setValue`](../api-reference/use-form#setvalue)           | Individual     | Whenever the value of a field has been set.                                                                                |
| `onBlur`                                                   | Individual     | Whenever a field has been touched. **If a validation method has been run by the `onChange` event, it won't be run again**. |
| `onSubmit`                                                 | All            | Whenever a submission attempt is made.                                                                                     |
| [`submit`](../api-reference/use-form#submit)               | All            | Whenever a submission attempt is made manually.                                                                            |
| [`runValidation`](../api-reference/use-form#runvalidation) | Individual/All | Manually running validation for the field(s) or form.                                                                      |

### How to Run

When validating with mixed ways, the results are deeply merged according to the following order:

1. Built-in validation
2. Field-level validation
3. Form-level validation

:::note
To make the validation result of each field works correctly with the [individual](#when-to-run) target events or methods. When using [form-level validation](#form-level-validation), please ensure the shape of the `errors` matches the form's `values`.
:::

## Displaying Error Messages

All errors are stored in the [formState.errors](./form-state#about-the-form-state), we can display error messages by accessing the `errors` object via the [mon](../api-reference/use-form#mon) method. The method provides an `errorWithTouched` option to help us filtering the errors of untouched fields, which is designed based on the [Errors in Forms design guideline](https://www.nngroup.com/articles/errors-forms-design-guidelines) (No.7). You can enable the feature by setting the option to `true` (see [related doc](./form-state#filter-untouched-field-errors)).

[![Edit RCF - Quick start](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-quick-start-j8p1l?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, mon } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // We can enable the "errorWithTouched" option to filter the error of an un-blurred field
  // Which helps the user focus on typing without being annoyed by the error message
  const errors = mon("errors", { errorWithTouched: true }); // Default is "false"

  return (
    <form ref={form} noValidate>
      <input name="username" required />
      {errors.username && <p>{errors.username}</p>}
      <input name="email" type="email" required />
      {errors.email && <p>{errors.email}</p>}
      <input name="password" type="password" required minLength={8} />
      {errors.password && <p>{errors.password}</p>}
      <input type="submit" />
    </form>
  );
};
```

When dealing with [nested fields](./complex-structures), you can shallow the errors and get free from checking valid chained properties (e.g. use `?.`) by the [array/object pick feature](./form-state#monitoring-the-state) of the `mon` method.

```js
const App = () => {
  // ...

  const [username, email, password] = mon(
    ["foo.username", "foo.email", "foo.password"],
    {
      errorWithTouched: true,
    }
  );

  return (
    <form ref={form} noValidate>
      <input name="foo.username" required />
      {username && <p>{username}</p>}
      <input name="foo.email" type="email" required />
      {email && <p>{email}</p>}
      <input name="foo.password" type="password" required minLength={8} />
      {password && <p>{password}</p>}
      <input type="submit" />
    </form>
  );
};
```

The built-in validation is **turned on** by default. Which provides two forms of error reports: the `message` (refer to [validationMessage](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage)) and the `state` (refer to [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)). You can configure (or disable) it by the [builtInValidationMode](../api-reference/use-form#builtonvalidationmode) option.

```js {5}
import { useForm } from "react-cool-form";

const App = () => {
  const { form, mon } = useForm({
    builtInValidationMode: "message" | "state" | false, // Default is "message"
    // More options...
  });
  const errors = mon("errors");

  console.log("Message mode: ", errors); // Returns a localized message that describes the validation constraints that the field does not satisfy (if any)
  console.log("State mode: ", errors); // Returns the "key" of the invalid property of the ValidityState (if any)

  return (
    <form ref={form} noValidate>
      <input name="username" required />
      <input type="submit" />
    </form>
  );
};
```

## Focus On Error

When the user submits a form that fails the validation, React Cool Form will apply focus to the first field with an error. The focus order is based on the field order (i.e. top-to-bottom and left-to-right), however you can change the order by the [focusOnError](../api-reference/use-form#focusonerror) option.
