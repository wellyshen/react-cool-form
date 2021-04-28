---
id: getting-started
title: Getting Started
slug: /
---

Building forms in [React](https://reactjs.org) might be a challenge. We have to face many tedious things like form data, validation, submission, and more 🤯.

As a React developer, there're two strategies for implementing forms, the [controlled components](https://reactjs.org/docs/forms.html#controlled-components) and [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html), each has its advantages and timing of use. The controlled components serve form state as [the single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth). However, the uncontrolled components make our code more **concise** and **performant**.

React Cool Form combines these advantages and references the [UX research](https://www.nngroup.com/articles/errors-forms-design-guidelines) of [Nielsen Norman Group](https://www.nngroup.com) as the basis for our [API](./api-reference/use-form) design to help you conquer all kinds of forms 👊🏻.

## Requirement

To use React Cool Form, you must use `react@16.8.0` or greater which includes hooks.

## Installation

This package is distributed via [npm](https://www.npmjs.com/package/react-cool-form).

```sh npm2yarn
$ npm install --save react-cool-form
```

:::info
React Cool Form supports all major browsers. For older browsers (e.g. IE11) without the `async/await`, `Promise`, and ES6+ features, you'll need to include a polyfill such as [core-js](https://github.com/zloirock/core-js).
:::

## CDN

If you're not using a module bundler or package manager. We also provide a [UMD](https://github.com/umdjs/umd) build which is available over the [unpkg.com](https://unpkg.com) CDN. Simply use a `<script>` tag to add it after [React CND links](https://reactjs.org/docs/cdn-links.html) as below:

<!-- prettier-ignore-start -->
```html
<script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
<!-- react-cool-form comes here -->
<script crossorigin src="https://unpkg.com/react-cool-form/dist/index.umd.production.min.js"></script>
```
<!-- prettier-ignore-end -->

Then you can access it via the `window.ReactCoolForm.<moduleName>` variables.

## Example

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
  const { form, watchState } = useForm({
    // (Strongly advise) Provide the default values
    defaultValues: { username: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // We can enable the "errorWithTouched" option to filter the error of an un-blurred field
  // Which helps the user focus on typing without being annoyed by the error message
  const errors = watchState("errors", { errorWithTouched: true }); // Default is "false"

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

✨ Pretty easy right? React Cool Form is more powerful than you think. Let's keep exploring!
