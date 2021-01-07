<p align="center">
  <a href="https://react-cool-form.netlify.app" title="React Cool Form"><img src="https://react-cool-form.netlify.app/img/logo-github.svg" width="300px" alt="React Cool Form"></a>
</p>

<p align="center">React hooks for forms state and validation, less code more performant.</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/react-cool-form?style=flat-square)](https://www.npmjs.com/package/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-cool-form?style=flat-square)](https://bundlephobia.com/result?p=react-cool-form)
[![netlify deploy](https://img.shields.io/netlify/3c201e27-b611-4512-b827-9523af7a1ae5?style=flat-square)](https://app.netlify.com/sites/react-cool-form/deploys)

</div>

## Features

- 🎣 [Easy to use](https://react-cool-form.netlify.app/docs/getting-started/integration-an-existing-form), just a React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook).
- 🗃 Manages [complex form data](https://react-cool-form.netlify.app/docs/getting-started/complex-structures) without hassle.
- 🚦 Supports [built-in](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#built-in-validation), [form-level](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#form-level-validation), and [field-level](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#field-level-validation) validation.
- 🚀 Highly performant, [minimizes the number of re-renders](https://react-cool-form.netlify.app#performance-matters) for you.
- 🧱 Seamless integration with existing HTML form inputs or [3rd-party UI libraries](https://react-cool-form.netlify.app/docs/getting-started/3rd-party-ui-libraries).
- 🎛 Super flexible [API](https://react-cool-form.netlify.app/docs/api-reference/use-form) design, built with [DX and UX](https://react-cool-form.netlify.app/docs) in mind.
- 🔩 Provides useful [utility functions](https://react-cool-form.netlify.app/docs/api-reference/utility-functions) to boost forms development.
- 📜 Supports [TypeScript](https://www.typescriptlang.org) type definition.
- ☁️ Server-side rendering compatibility.
- 🦔 Tiny size ([~ 5KB gzipped](https://bundlephobia.com/result?p=react-cool-form)) but powerful.

## [Docs](https://react-cool-form.netlify.app)

See the documentation at [react-cool-form.netlify.app](https://react-cool-form.netlify.app) for more information about using React Cool Form!

Frequently viewed docs:

- [Getting Started](https://react-cool-form.netlify.app/docs)
- [Examples](https://react-cool-form.netlify.app/docs/examples/basic)
- [API Reference](https://react-cool-form.netlify.app/docs/api-reference/use-form)

## Quick Start

To use React Cool Form, you must use `react@16.8.0` or greater which includes hooks. This package is distributed via [npm](https://www.npmjs.com/package/react-cool-form).

```sh
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

Here's the basic concept of how it rocks:

[![Edit RCF - Quick start](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-quick-start-j8p1l?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const Field = ({ label, id, error, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
    {error && <p>{error}</p>}
  </div>
);

const App = () => {
  const { form, getState } = useForm({
    // (Strongly advise) Provide the default values just like we use React state
    defaultValues: { username: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // We can enable the "errorWithTouched" option to filter the error of an un-blurred field
  // Which helps the user focus on typing without being annoyed by the error message
  const errors = getState("errors", { errorWithTouched: true }); // Default is "false"

  return (
    <form ref={form} noValidate>
      <Field
        label="Username"
        id="username"
        name="username"
        // Support built-in validation
        required
        error={errors.username}
      />
      <Field
        label="Email"
        id="email"
        name="email"
        type="email"
        required
        error={errors.email}
      />
      <Field
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
        error={errors.password}
      />
      <input type="submit" />
    </form>
  );
};
```

✨ Pretty easy right? React Cool Form is more powerful than you think. Let's [explore it](https://react-cool-form.netlify.app)!

## To Do

- [ ] Unit testing (work in progress...)
- [ ] End to end testing
