> 🚨 Under developing API may be changed super fast, don't use it now. Please note any changes via [release](https://github.com/wellyshen/react-cool-form/releases). Here's the [milestone](#milestone).

# <b>REACT COOL FORM</b>

React hooks for forms state, validation, and performance.

[![npm version](https://img.shields.io/npm/v/react-cool-form?style=flat-square)](https://www.npmjs.com/package/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dm/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-cool-form?style=flat-square)](https://bundlephobia.com/result?p=react-cool-form)

## Milestone

- [x] Core features
- [x] Type definition
- [x] Support server-side rendering
- [x] CI/CD
- [ ] Documentation
- [ ] Examples
- [ ] Unit testing
- [ ] End to end testing

## Getting Started

To use `react-cool-form`, you must use react@16.8.0 or greater which includes hooks.

You can install this package via [npm](https://www.npmjs.com/package/react-cool-form).

```bash
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

Here's the basic example of how does it works, I'll provide the full documentation soon. If you have any question, feel free to [ask me](https://github.com/wellyshen/react-cool-form/issues/new?template=question.md).

[![Edit useForm - basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-cool-form-basic-gb0dj?fontsize=14&hidenavigation=1&theme=dark)

```javascript
import { useForm } from "react-cool-form";

const defaultValues = {
  name: "",
  email: "",
  password: "",
};

const App = () => {
  const { formRef, getState } = useForm({
    // Provide the default values for our form state
    defaultValues,
    onSubmit: (values, actions) => {
      // Triggered when the form is valid
      console.log("onSubmit: ", values);
    },
    onError: (errors, actions) => {
      // Triggered when the form is invalid
      console.log("onError: ", errors);
    },
  });

  const [errors, touched] = getState(["errors", "touched"]);

  return (
    <form ref={formRef} noValidate>
      <label>Name</label>
      {/* Support built-in validation attributes */}
      <input name="name" required />
      {touched.name && <p>{errors.name}</p>}

      <label>Email</label>
      <input name="email" type="email" required />
      {touched.email && <p>{errors.email}</p>}

      <label>Password</label>
      <input name="password" type="password" required minLength={8} />
      {touched.password && <p>{errors.password}</p>}

      <input type="reset" />
      <input type="submit" />
    </form>
  );
};
```

Super easy right? The above example is just the tip of the iceberg. `react-cool-form` is a lightweight and powerful form library, you can visit the [type definition](https://github.com/wellyshen/react-cool-form/blob/master/src/types/react-cool-form.d.ts) to understand how it rocks 🤘🏻.
