---
id: accessibility
title: Accessibility (a11y)
hide_table_of_contents: true
---

Web accessibility (a.k.a [a11y](https://en.wiktionary.org/wiki/a11y)) is the design and creation of websites that can be used by everyone. Accessibility support is necessary to allow assistive technology to interpret web pages. React Cool Form is designed to keep your input elements **clean** that helps you build accessible forms by using standard HTML techniques.

- Provide [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) elements to all the form controls, a screen reader will read out the label when the user is focused on the field.
- Use the [aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-invalid_attribute) to indicate a field has failed validation for the screen reader user.
- Use the [aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-describedby_attribute) to tie an error message with a field, a screen reader will read out the error message when the user is focused on the field.
- Use the [alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alert_role) to provide a suggestion to the user for correction on form field errors, a screen reader will read out the alert message when it's added to the document structure.

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, mon } = useForm({
    defaultValues: { username: "", email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [errors, isValid] = mon(["errors", "isValid"], {
    errorWithTouched: true,
  });

  return (
    <>
      {!isValid && (
        <h2>
          <span role="alert">
            😭 Please fix the errors before you can submit this form
          </span>
        </h2>
      )}
      <form ref={form} noValidate>
        <label htmlFor="username">
          Username <span>*</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          aria-invalid={!!errors.username}
          aria-describedby="username-hint"
        />
        {errors.username && <span id="username-hint">{errors.username}</span>}
        <label htmlFor="email">
          Email <span>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby="email-hint"
        />
        {errors.email && <span id="email-hint">{errors.email}</span>}
        <label htmlFor="password">
          Password <span>*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          aria-invalid={!!errors.password}
          aria-describedby="password-hint"
        />
        {errors.password && <span id="password-hint">{errors.password}</span>}
        <input type="submit" />
      </form>
    </>
  );
};
```
