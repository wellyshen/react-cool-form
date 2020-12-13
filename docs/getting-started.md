---
id: getting-started
title: Getting Started
slug: /
---

Building forms in [React](https://reactjs.org) might be a challenge. We have to face many tedious things like form data, validation, submission, and more 🤯.

As a React developer, there're two strategies of implementing forms, the [controlled components](https://reactjs.org/docs/forms.html#controlled-components) and [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html), each has its advantages and timing of use. The controlled components serve form state as [the single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth). However, the uncontrolled components make our code more **concise** and **performant**.

React Cool Form combines these advantages and references the [UX theory](https://www.nngroup.com/articles/errors-forms-design-guidelines) of [Nielsen Norman Group](https://www.nngroup.com) as the basis for our [API](./docs/use-form) design to help you beat all kinds of forms 👊🏻.

## Requirement

To use React Cool Form, you must use `react@16.8.0` or greater which includes hooks.

## Installation

This package is distributed via [npm](https://www.npmjs.com/package/react-cool-form).

```sh
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

> ⚠️ React Cool Form supports all major browsers. For older browsers (e.g. IE11) without the `async/await`, `Promise`, and ES6+ features, you'll need to include a polyfill such as [core-js](https://github.com/zloirock/core-js).

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

Here's the basic concept of how does it rocks:

[![Edit RCF - Basic concept](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-basic-concept-sv7mg?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, getState } = useForm({
    // Provide the default values just like we use "React.useState" or "React.useReducer"
    defaultValues: { username: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  // React Cool Form filters the error of an un-blurred field by default (via the "filterUntouchedErrors" option)
  // Which helps the user focus on typing without being annoying
  const errors = getState("errors", { filterUntouchedErrors: true });

  return (
    <form ref={form} noValidate>
      <div>
        {/* Support built-in validation */}
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

✨ Pretty easy right? React Cool Form is more powerful than you think. Let's keep exploring!
