---
id: reset-form
title: Reset Form
---

There're two common ways to reset all form data: [reset after form submission](#reset-after-form-submission) and [reset form manually](#reset-form-manually). You may ask "how about the reset button?" Well... according to the [UX research](https://www.nngroup.com/articles/reset-and-cancel-buttons), which summarized: **"Most Web forms would have improved usability if the Reset button was removed."** So, generally not recommend but [still supported](#reset-button-not-recommended).

## Reset After Form Submission

We can use React Cool Form's [reset](../api-reference/use-form#reset) method (also available from the [onSubmit](../api-reference/use-form#onsubmit) handler) to restore the form to its default values as well as clear/reset all the [related state](./form-state#about-the-form-state).

[![Edit RCF - Reset Form](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-reset-form-uikxg?fontsize=14&hidenavigation=1&theme=dark)

```js {13}
import { useForm } from "react-cool-form";

const Field = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
);

const App = () => {
  const { form } = useForm({
    defaultValues: { firstName: "Welly", lastName: "Shen" },
    onSubmit: (values, { reset }) => reset(),
    onReset: (values) => console.log("onReset: ", values), // Triggered when the form is reset
  });

  return (
    <form ref={form}>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <input type="submit" />
    </form>
  );
};
```

## Reset Form Manually

We can also lazily set (or update) the form's default values by the `reset` method.

[![Edit RCF - Lazy Default Values](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-lazy-default-values-qxvlz?fontsize=14&hidenavigation=1&theme=dark)

```js {11}
import { useEffect } from "react";
import { useForm } from "react-cool-form";

const App = () => {
  const { form, reset } = useForm({
    onReset: (values) => console.log("onReset: ", values), // Triggered when the form is reset
  });

  useEffect(async () => {
    const data = await fetchData("https://form-values"); // Returns { firstName: "Welly", lastName: "Shen" }
    reset(data);
  }, [reset]);

  const handleFormReset = async () => {
    const data = await fetchData();
    reset(data);
  };

  return (
    <form ref={form}>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <input type="submit" />
    </form>
  );
};
```

## Reset Button (not recommended)

As the [UX research](https://www.nngroup.com/articles/reset-and-cancel-buttons) mentioned: **"Most Web forms would have improved usability if the Reset button was removed."** But in case you need it, React Cool Form supports the [onreset](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onreset) internally. All we need to do is to provide an `<input type="reset">` to the user.

```js {11}
import { useForm } from "react-cool-form";

const App = () => {
  const { form, reset } = useForm({
    onReset: (values) => console.log("onReset: ", values), // Triggered when the form is reset
  });

  return (
    <form ref={form}>
      {/* ... */}
      <input type="reset" />
    </form>
  );
};
```
