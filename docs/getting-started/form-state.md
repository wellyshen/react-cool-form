---
id: form-state
title: Form State
---

Building highly performant forms is the duty of React Cool Form. It minimizes the number of re-renders and provides the best user experience by the following features:

- No unnecessary re-renders by leveraging the power of [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html)
- No unnecessary re-renders when [using the form state](#using-the-form-state)
- No unnecessary re-renders when receives the same form state (since last re-rendering)
- Filters the errors of untouched fields for better UX (refer the [theory](https://www.nngroup.com/articles/errors-forms-design-guidelines) at No.7)

Here we will explore the form state and some [best practices for using it](#best-practices).

## About the Form State

Form state is an `object` containing the following values:

| Name         | Type      | Description                                                                                                                                      |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| values       | `object`  | The current values of the form.                                                                                                                  |
| errors       | `object`  | The current validation errors. [The shape will (should) match the shape of the form's values](./validation-guide#how-to-run).                    |
| touched      | `object`  | An object containing all the fields the user has touched/visited.                                                                                |
| isDirty      | `boolean` | Returns `true` if the user modifies any of the fields. `false` otherwise.                                                                        |
| dirtyFields  | `object`  | An object containing all the fields the user has modified.                                                                                       |
| isValidating | `boolean` | Returns `true` if the form is currently being validated. `false` otherwise.                                                                      |
| isValid      | `boolean` | Returns `true` if the form doesn't have any errors (i.e. the `errors` object is empty). `false` otherwise.                                       |
| isSubmitting | `boolean` | Returns `true` if the form is currently being submitted. `false` if otherwise.                                                                   |
| isSubmitted  | `boolean` | Returns `true` if the form has been submitted successfully. `false` if otherwise. The value will remain until the [form is reset](./reset-form). |
| submitCount  | `number`  | Number of times the user tried to submit the form. The value will remain until the [form is reset](./reset-form).                                |

> 🚨 The values of form state are readonly properties and should not be mutated directly.

## Using the Form State

React Cool Form provides the [getState](../api-reference/use-form#getstate) method to help us avoid unnecessary re-renders when using the form state.

### Accessing State

When accessing the form state we can tell the `getState` method to get/construct the values as below:

```js
import { useForm } from "react-cool-form";

const { getState } = useForm();

// Value pick, re-renders the component when "values.foo" changes
const foo = getState("values.foo");

// Array pick, re-renders the component when either "values.foo" or "values.bar" changes
const [foo, bar] = getState(["values.foo", "values.bar"]);

// Object pick, re-renders the component when either "values.foo" or "values.bar" changes
const { foo, bar } = getState({ foo: "values.foo", bar: "values.bar" });
```

From the example above, you can see we are getting the values of a specific target, it's kind of verbose. We can reduce it by using the `target` option.

```js
const [foo, bar, baz] = getState(["foo", "bar", "baz"], { target: "values" });
```

### Best Practices

Every time we access a value from the form state via the `getState` method, it will watch the changes of the value and trigger re-rendering only when necessary. Thus, there are some guidelines for us to use the form state.

```js
Coming soon...
```
