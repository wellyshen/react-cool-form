---
id: reset-form
title: Reset Form
---

There're two common ways to reset all form data: [reset after form submission](#reset-after-form-submission) and [reset form manually](#reset-form-manually). You may ask "how about the reset button?" Well... according to the [UX research](https://www.nngroup.com/articles/reset-and-cancel-buttons), which summarized: **Most Web forms would have improved usability if the Reset button was removed. Cancel buttons are also often of little value on the Web.** So, generally not recommend but [still supported](#reset-button-not-recommended).

## Reset After Form Submission

We can use the [reset](../api-reference/use-form#reset) helper of the [onSubmit](../api-reference/use-form#onsubmit) handler to restores the form to its default values and clear/reset all the [related state](./form-state#about-the-form-state).

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
  const { form, reset } = useForm({
    defaultValues: { firstName: "Welly", lastName: "Shen" },
    onSubmit: (values, { reset }) => reset(),
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

Coming soon...

## Reset Button (not recommended)

Coming soon...
