> 🚨 Under developing the API may be changed fast, **DON'T USE IT ATM**. Please note any changes via [release](https://github.com/wellyshen/react-cool-form/releases). Here's the [milestone](#milestone).

# <b>REACT COOL FORM</b>

React hooks for forms state and validation, less code more performant.

[![npm version](https://img.shields.io/npm/v/react-cool-form?style=flat-square)](https://www.npmjs.com/package/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dm/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-cool-form?style=flat-square)](https://bundlephobia.com/result?p=react-cool-form)

## Features

- 🎣 Easy to use, just a React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook).
- 🗃 Manages complex form data without hassle.
- 🚦 Supports [built-in](https://react-cool-form.netlify.app/docs/validation-guide#built-in-validation), [field-level](https://react-cool-form.netlify.app/docs/validation-guide#field-level-validation), and [form-level](https://react-cool-form.netlify.app/docs/validation-guide#form-level-validation) validations.
- 🚀 Highly performant, minimizes the number of re-renders for you.
- 🧱 Seamless integration with custom components or UI libraries.
- 🎛 Super flexible [API](https://react-cool-form.netlify.app/docs/use-form) design, built with [DX and UX](https://react-cool-form.netlify.app/docs) in mind.
- 🔩 Provides useful utility functions to boost forms development.
- 📜 Supports [TypeScript](https://www.typescriptlang.org) type definition.
- ☁️ Server-side rendering compatibility.
- 🦔 Tiny size ([~ 4.8KB gzipped](https://bundlephobia.com/result?p=react-cool-form)) but powerful.

## [Docs](https://react-cool-form.netlify.app)

See the documentation at [react-cool-form.netlify.app](https://react-cool-form.netlify.app) for more information about using `react-cool-form`!

Frequently viewed docs:

- [Getting Started](https://react-cool-form.netlify.app/docs)
- [API Reference](https://react-cool-form.netlify.app/docs/use-form)

## Quick Start

To use `react-cool-form`, you must use `react@16.8.0` or greater which includes hooks. This package is distributed via [npm](https://www.npmjs.com/package/react-cool-form).

```sh
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

Here's the basic example of how does it works:

[![Edit RCF - Basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-basic-jq93g?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, getState } = useForm({
    // Provide the default values just like we use "React.useState" or "React.useReducer"
    defaultValues: { name: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // react-cool-form filters the error of an un-blurred field by default (via the "filterUntouchedErrors" option)
  // Which helps the user focus on typing without being annoying
  const errors = getState("errors", { filterUntouchedErrors: true });

  return (
    <form ref={form} noValidate>
      <div>
        {/* Support built-in validation */}
        <input name="name" placeholder="Name" required />
        {errors.name && <p>{errors.name}</p>}
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
          minLength={8}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      <input type="submit" />
    </form>
  );
};
```

✨ Pretty easy right? `react-cool-form` is more powerful than you think. Let's [explore it](https://react-cool-form.netlify.app)!

## Milestone

- [x] Core features
- [x] Type definition
- [x] Support server-side rendering
- [x] CI/CD
- [ ] Unit testing (in-progress...)
- [ ] Documentation (in-progress...)
- [ ] Logo design
- [ ] Examples
- [ ] End to end testing
