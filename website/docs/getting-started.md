---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
slug: /
---

TODO: Introduction...

## Requirement

To use `react-cool-form`, you must use `react@16.8.0` or greater which includes hooks.

## Installation

This package is distributed via [npm package](https://www.npmjs.com/package/react-cool-form).

```sh
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

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

Here's the basic example of how does it works:

[![Edit RCF - Basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-basic-jq93g?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, getState } = useForm({
    // Provide the default values just like we use "React.useState" or "React.useReducer"
    defaultValues: { name: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values, actions) => console.log("onSubmit: ", values),
  });

  // react-cool-form filters the error of a un-blurred field by default (via the "filterUntouchedErrors" option)
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
      <input type="reset" />
    </form>
  );
};
```

✨ Pretty easy right? `react-cool-form` is more powerful than you think. Let's keep exploring!
