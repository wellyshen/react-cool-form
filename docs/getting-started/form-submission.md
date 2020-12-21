---
id: form-submission
title: Form Submission
slug: /form-submission
---

It's dead simple to submit a form in React Cool Form. All we need to do is use an `<input type="submit">` or `<button type="submit">` element to fire the form's `onSubmit` event. React Cool Form also provides the [submit](./use-form#submit) method to help us overcome [any kinds of design challenges](#manually-triggering-submission) easily.

## Submit a Form

This is the most common case that we submit a form via React Cool Form.

```js
import { useForm } from "react-cool-form";

// Synchronous submission
const submitHandler = (values, options /* Useful states and methods */, e) => {
  console.log("onSubmit: ", values);
};

// Asynchronous submission
const submitHandler = async (values, options, e) => {
  await new Promise((r) => setTimeout(r, 2000));
  console.log("onSubmit: ", values);
};

const errorHandler = (errors, options, e) => {
  console.log("onError: ", errors);
};

const App = () => {
  const { form, getState } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: submitHandler, // 🙆🏻‍♀️ The event is triggered once the form is valid
    onError: errorHandler, // 🙅🏻‍♀️ The event is triggered once the form is invalid (optional)
  });
  const isSubmitting = getState("isSubmitting");

  return (
    <form ref={form} noValidate>
      <input name="username" placeholder="Username" required />
      <input name="email" placeholder="Email" required />
      <input type="submit" disabled={isSubmitting} />
    </form>
  );
};
```

## Submission Phases

You might be curious about what happened after we clicking the submit button? Whenever we submit a form, React Cool Form will execute the following procedures:

## Manually Triggering Submission

```js
Coming soon...
```
