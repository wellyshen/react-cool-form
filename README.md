<p align="center">
  <code><strong>Hi! friends, if this library has helped you out, please support us with a ⭐️</strong></code>
  <br /><br />
  <a href="https://react-cool-form.netlify.app" title="React Cool Form"><img src="https://react-cool-form.netlify.app/img/logo-github.svg" width="300px" alt="React Cool Form"></a>
</p>

<p align="center">React hooks for forms state and validation, less code more performant.</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/react-cool-form?style=flat-square)](https://www.npmjs.com/package/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![coverage status](https://img.shields.io/coveralls/github/wellyshen/react-cool-form?style=flat-square)](https://coveralls.io/github/wellyshen/react-cool-form?branch=master)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
[![netlify deploy](https://img.shields.io/netlify/3c201e27-b611-4512-b827-9523af7a1ae5?style=flat-square)](https://app.netlify.com/sites/react-cool-form/deploys)

</div>

## Features

- 🎣 [Easy to use](https://react-cool-form.netlify.app/docs/getting-started/integration-an-existing-form), React Cool Form is [a set of React hooks](https://react-cool-form.netlify.app/docs/api-reference/use-form) that helps you conquer all kinds of forms.
- 🗃 Manages [dynamic](https://react-cool-form.netlify.app/docs/examples/conditional-fields) and [complex](https://react-cool-form.netlify.app/docs/getting-started/complex-structures) form data without hassle.
- 🪄 Manages [arrays and lists](https://react-cool-form.netlify.app/docs/getting-started/arrays-and-lists) data like a master.
- 🚦 Supports [built-in](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#built-in-validation), [form-level](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#form-level-validation), and [field-level](https://react-cool-form.netlify.app/docs/getting-started/validation-guide#field-level-validation) validation.
- 🚀 Highly performant, [minimizes the number of re-renders](https://react-cool-form.netlify.app#performance-matters) for you.
- 🧱 Seamless integration with existing HTML form inputs or [3rd-party UI libraries](https://react-cool-form.netlify.app/docs/getting-started/3rd-party-ui-libraries).
- 🎛 Super flexible [API](https://react-cool-form.netlify.app/docs/api-reference/use-form) design, built with [DX and UX](https://react-cool-form.netlify.app/docs) in mind.
- 🔩 Provides useful [utility functions](https://react-cool-form.netlify.app/docs/api-reference/utility-functions) to boost forms development.
- 📜 Supports [TypeScript](https://react-cool-form.netlify.app/docs/getting-started/typescript-support) type definition.
- ☁️ Server-side rendering compatibility.
- 🦔 A [tiny size](https://react-cool-form.netlify.app/docs/getting-started/bundle-size-overview) ([~ 7.1kB gizpped](https://bundlephobia.com/result?p=react-cool-form)) library but powerful.

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
  const { form, use } = useForm({
    // (Strongly advise) Provide the default values
    defaultValues: { username: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // We can enable the "errorWithTouched" option to filter the error of an un-blurred field
  // Which helps the user focus on typing without being annoyed by the error message
  const errors = use("errors", { errorWithTouched: true }); // Default is "false"

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
        minLength={8}
        error={errors.password}
      />
      <input type="submit" />
    </form>
  );
};
```

✨ Pretty easy right? React Cool Form is more powerful than you think. Let's [explore it](https://react-cool-form.netlify.app) now!

## Articles / Blog Posts 

> 💡 If you have written any blog post or article about React Cool Form, please open a PR to add it here.

- Featured on [React Status #245](https://react.statuscode.com/issues/245).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://wellyshen.com"><img src="https://avatars.githubusercontent.com/u/21308003?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Welly</b></sub></a><br /><a href="#ideas-wellyshen" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/wellyshen/react-cool-form/commits?author=wellyshen" title="Code">💻</a> <a href="https://github.com/wellyshen/react-cool-form/commits?author=wellyshen" title="Documentation">📖</a> <a href="#infra-wellyshen" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-wellyshen" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/Chris-James"><img src="https://avatars.githubusercontent.com/u/4596428?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chris</b></sub></a><br /><a href="https://github.com/wellyshen/react-cool-form/issues?q=author%3AChris-James" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
