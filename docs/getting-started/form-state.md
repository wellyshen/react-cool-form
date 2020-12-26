---
id: form-state
title: Form State
---

Building highly performant forms is the duty of React Cool Form. It minimizes the number of re-renders and provides the best user experience by the following features:

- No unnecessary re-renders by leveraging the power of [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html)
- No unnecessary re-renders when [using the form state](#using-the-form-state)
- No unnecessary re-renders when receives the same form state (since last re-rendering)
- [Filters the errors of untouched fields](#filters-untouched-field-errors) for better UX (refer the [theory](https://www.nngroup.com/articles/errors-forms-design-guidelines) at No.7)

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

React Cool Form provides a powerful method: [getState](../api-reference/use-form#getstate) to help us avoid unnecessary re-renders when using the form state.

### Accessing the State

Due to the support of [complex form data](./complex-form-data), the `getState` method allows us to use [dot](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Dot_notation) and [bracket](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Bracket_notation) notation to get the form state.

```js
import { useForm } from "react-cool-form";

const { getState } = useForm();

// Returns { name: "Welly", orders: ["🍕", "🥤"] }
// Re-renders the component when either "values.user" or "values.user.<property>" changes
const user = getState("values.user");

// Returns "Welly", re-renders the component when "values.user.name" changes
const name = getState("values.user.name");

// Returns "🍕", re-renders the component when "values.user.orders" changes
const pizza = getState("values.user.orders[0]");
```

We can construct an array/object with multiple state-picks inside like the following example:

```js
import { useForm } from "react-cool-form";

const { getState } = useForm();

// Array pick, re-renders the component when either "values.foo" or "values.bar" changes
const [foo, bar] = getState(["values.foo", "values.bar"]);

// Object pick, re-renders the component when either "values.foo" or "values.bar" changes
const { foo, bar } = getState({ foo: "values.foo", bar: "values.bar" });
```

From the code above, you can see we are getting the values of a specific target, it's kind of verbose. We can reduce it by the `target` option.

<!-- prettier-ignore-start -->
```js
// { values: { foo: "🍎", bar: "🥝", baz: "🍋" } }
const [foo, bar, baz] = getState(["foo", "bar", "baz"], { target: "values" });

// { values: { nest: { foo: "🍎", bar: "🥝", baz: "🍋" } } }
const [foo, bar, baz] = getState(["foo", "bar", "baz"], { target: "values.nest" });
```
<!-- prettier-ignore-end -->

### Best Practices

Every time we access a value from the form state via the `getState` method, it will watch the changes of the value and trigger re-renders only when necessary. Thus, there are some guidelines for us to use the form state.

```js
Coming soon...
```

### Reading the State

If you just want to read the state's values without triggering re-renders, you can turn the **watch mode** off by setting the `watch` option to `false`.

```js {6}
import { useForm } from "react-cool-form";

const { getState } = useForm();

const SomeHandler = () => {
  const [isValid, values] = getState(["isValid", "values"] { watch: false });

  if (isValid) createRecordOnServer(values);
};
```

### Filters Untouched Field Errors

Coming soon...
