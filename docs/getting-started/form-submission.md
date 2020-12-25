---
id: form-submission
title: Form Submission
---

It's dead simple to submit a form in React Cool Form. All we need to do is use an `<input type="submit">` or `<button type="submit">` element to fire the form's `onSubmit` event. Moreover, we can also [manually trigger a submission](#manually-triggering-submission) by the [submit](../api-reference/use-form#submit) method of React Cool Form, which can help us overcome any kinds of design challenges easily.

## Submit a Form

This is the most common case that we submit a form in React Cool Form.

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
      <input name="username" required />
      <input name="email" required />
      <input type="submit" disabled={isSubmitting} />
    </form>
  );
};
```

## Submission Phases

You might be curious about what happened after we clicked the submit button? Whenever a form is attempting to be submitted, React Cool Form will execute the following procedures:

### Pre-submit

- Touches all fields (for displaying errors)
- Sets `formState.isSubmitting` to `true`
- Increments `formState.submitCount` by 1

### Validation

- Sets `formState.isValidating` to `true`
- Runs all [built-in](./validation-guide#built-in-validation), [field-level](./validation-guide#field-level-validation), and [form-level](./validation-guide#form-level-validation) validations asynchronously and [deeply merges the results](./validation-guide#how-to-run).
- Once the validation is completed, sets `formState.isValidating` to `false`

### Check for Errors

Are there any errors?

- Yes (Invalid): Runs the form's `onError` handler, jumps to "Post-submit"
- No (Valid): Proceeds to "Submission"

### Submission

- Runs the form's `onSubmit` handler
- Once the submission is completed, sets `formState.isSubmitted` to `true`

### Post-submit

- Sets `formState.isSubmitting` to `false`

> 💡 You can check the [Form State](./form-state#about-the-form-state) to learn more about it.

## Manually Triggering Submission

For some reasons (e.g. design requirement, auto-retry etc.), we may need to trigger a submission manually. However, we can use the [submit](../api-reference/use-form#submit) method to achieve it.

```js {22}
import { useForm } from "react-cool-form";

const App = () => {
  const { form, getState, submit } = useForm({
    defaultValues: { username: "", email: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });
  const isSubmitting = getState("isSubmitting");

  const handleSubmit = () => {
    submit();
  };

  // Handle submit with result, so we don't have to rely on the event handlers
  const handleSubmit = async () => {
    const { errors, values } = await submit();

    if (errors) {
      // Do something for invalid case
    } else {
      // Do something for valid case
    }
  };

  return (
    <>
      <ActionBar>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          Submit
        </button>
      </ActionBar>
      <form ref={form} noValidate>
        <input name="username" required />
        <input name="email" required />
      </form>
    </>
  );
};
```
