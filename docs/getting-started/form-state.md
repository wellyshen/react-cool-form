---
id: form-state
title: Form State
---

Building highly performant forms is the duty of React Cool Form. It minimizes the number of re-renders and provides the best user experience by the following features:

- No unnecessary re-renders by leveraging the power of [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html)
- No unnecessary re-renders when [using the form state](#using-the-form-state)
- No unnecessary re-renders when receives the same form state (since last re-rendering)
- [Filters the errors of untouched fields](#filter-untouched-field-errors) for better UX (refer to the [UX research](https://www.nngroup.com/articles/errors-forms-design-guidelines) at No.7)

Here we will explore the form state and some [best practices for using it](#best-practices).

## About the Form State

Form state is an `object` containing the following properties:

| Name         | Type      | Description                                                                                                                                      |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| values       | `object`  | The current values of the form.                                                                                                                  |
| errors       | `object`  | The current validation errors. [The shape will (should) match the shape of the form's values](./validation-guide#how-to-run).                    |
| touched      | `object`  | An object containing all the fields the user has touched/visited.                                                                                |
| isDirty      | `boolean` | Returns `true` if the user modifies any of the fields. `false` otherwise.                                                                        |
| dirty        | `object`  | An object containing all the fields the user has modified.                                                                                       |
| isValidating | `boolean` | Returns `true` if the form is currently being validated. `false` otherwise.                                                                      |
| isValid      | `boolean` | Returns `true` if the form doesn't have any errors (i.e. the `errors` object is empty). `false` otherwise.                                       |
| isSubmitting | `boolean` | Returns `true` if the form is currently being submitted. `false` if otherwise.                                                                   |
| isSubmitted  | `boolean` | Returns `true` if the form has been submitted successfully. `false` if otherwise. The value will remain until the [form is reset](./reset-form). |
| submitCount  | `number`  | Number of times the user tried to submit the form. The value will remain until the [form is reset](./reset-form).                                |

## Using the Form State

React Cool Form provides a powerful method: [select](../api-reference/use-form#select) to help us avoid unnecessary re-renders when using the form state.

### Accessing the State

Due to the support of [complex structures](./complex-structures), the `select` method allows us to use [dot](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Dot_notation)-and-[bracket](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Bracket_notation) notation to get the form state.

```js
const { select } = useForm();

// Returns { name: "Welly", orders: ["🍕", "🥤"] }
// Re-renders the component when either "values.user" or "values.user.<property>" changes
const user = select("values.user");

// Returns "Welly", re-renders the component when "values.user.name" changes
const name = select("values.user.name");

// Returns "🍕", re-renders the component when "values.user.orders" changes
const pizza = select("values.user.orders[0]");
```

We can construct an array/object with multiple state-picks inside like the following example:

```js
const { select } = useForm();

// Array pick, re-renders the component when either "values.foo" or "values.bar" changes
const [foo, bar] = select(["values.foo", "values.bar"]);

// Object pick, re-renders the component when either "values.foo" or "values.bar" changes
const { foo, bar } = select({ foo: "values.foo", bar: "values.bar" });
```

From the code above, you can see we are getting the values of a specific target, it's kind of verbose. We can reduce it by the `target` option.

<!-- prettier-ignore-start -->
```js
// Current state: { values: { foo: "🍎", bar: "🥝", baz: "🍋" } }
const [foo, bar, baz] = select(["foo", "bar", "baz"], { target: "values" });

// Current state: { values: { nest: { foo: "🍎", bar: "🥝", baz: "🍋" } } }
const [foo, bar, baz] = select(["foo", "bar", "baz"], { target: "values.nest" });
```
<!-- prettier-ignore-end -->

### Best Practices

Every time we access a value from the form state via the `select` method, it will watch the changes of the value and trigger re-renders only when necessary. Thus, there're some guidelines for us to use the form state. General speaking, when getting a value from an `object` state, **more specific more performant**.

```js
const { select } = useForm();

// 🙅🏻‍♀️ You can, but not recommended because it will cause the component to update on every value change
const values = select("values");
// 🙆🏻‍♀️ For the form's values, we always recommended getting the target value as specific as possible
const fooValue = select("values.foo");

// 🙆🏻‍♀️ It's OK, in most case the form's validation will be triggered less frequently
const errors = select("errors");
// 🙆🏻‍♀️ But if a validation is triggered frequently, get the target error instead
const fooError = select("errors.foo");

// 🙆🏻‍♀️ It's OK, they are triggered less frequently
const [touched, dirty] = select(["touched", "dirty"]);
```

### Reading the State

If you just want to read the state's values without triggering re-renders, here's the [getState](../api-reference/use-form#getstate) method for you.

```js {4}
const { getState } = useForm();

const SomeHandler = () => {
  const [isValid, values] = getState(["isValid", "values"]);

  if (isValid) createRecordOnServer(values);
};
```

With the `getState`, we can read/organize the data by the following ways:

```js
const { getState } = useForm();

// Reading the form state
const state = getState();

// Reading a value of the form state
const foo = getState("values.foo");

// Array pick
const [foo, bar] = getState(["values.foo", "values.bar"]);

// Object pick
const { foo, bar } = getState({ foo: "values.foo", bar: "values.bar" });

// Reading the values of a specific target
// Current state: { values: { foo: "🍎", bar: "🥝", baz: "🍋" } }
const [foo, bar, baz] = getState(["foo", "bar", "baz"], "values");
```

### Filter Untouched Field Errors

Error messages are dependent on the form's validation (i.e. the `errors` object). To avoid annoying the user by seeing an error message while typing, we can filter the errors of untouched fields by enable the `select`'s `errorWithTouched` option.

> 💡 This feature filters any errors of the untouched fields. So when validating with the [runValidation](../api-reference/use-form#runvalidation), please ensure it's triggered after the field(s) is (are) touched.

```js
const { select } = useForm();

// Current form state: { errors: { foo: "Required" }, touched: { foo: true } }

// Returns {}
const errors = select("errors");

// Returns { foo: "Required" }
const errors = select("errors", { errorWithTouched: true }); // Default is "false"
```

👉🏻 Check the [Displaying Error Messages](./validation-guide#displaying-error-messages) to learn more about it.
