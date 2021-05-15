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

| Name         | Type      | Description                                                                                                                   |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| values       | `object`  | The current values of the form.                                                                                               |
| errors       | `object`  | The current validation errors. [The shape will (should) match the shape of the form's values](./validation-guide#how-to-run). |
| touched      | `object`  | An object containing all the fields the user has touched/visited.                                                             |
| isDirty      | `boolean` | Returns `true` if the user modifies any of the fields. `false` otherwise.                                                     |
| dirty        | `object`  | An object containing all the fields the user has modified.                                                                    |
| isValidating | `boolean` | Returns `true` if the form is currently being validated. `false` otherwise.                                                   |
| isValid      | `boolean` | Returns `true` if the form doesn't have any errors (i.e. the `errors` object is empty). `false` otherwise.                    |
| isSubmitting | `boolean` | Returns `true` if the form is currently being submitted. `false` if otherwise.                                                |
| isSubmitted  | `boolean` | Returns `true` if the form has been submitted successfully. `false` if otherwise.                                             |
| submitCount  | `number`  | Number of times the user tried to submit the form. The value will remain until the [form is reset](./reset-form).             |

## Using the Form State

React Cool Form provides a powerful API: [use](../api-reference/use-form#use) to help us avoid unnecessary re-renders when using the form state.

### Watching the State

Due to the support of [complex structures](./complex-structures), the `use` method allows us to use [dot](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Dot_notation)-and-[bracket](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Bracket_notation) notation to get the form state.

```js
const { use } = useForm();

// Returns { name: "Welly", orders: ["🍕", "🥤"] }
// Re-renders the component when either "values.user" or "values.user.<property>" changes
const user = use("values.user");

// Returns "Welly", re-renders the component when "values.user.name" changes
const name = use("values.user.name");

// Returns "🍕", re-renders the component when "values.user.orders" changes
const pizza = use("values.user.orders[0]");
```

We can construct an array/object with multiple state-picks inside like the following example:

```js
const { use } = useForm();

// Array pick, re-renders the component when either "values.foo" or "values.bar" changes
const [foo, bar] = use(["values.foo", "values.bar"]);

// Object pick, re-renders the component when either "values.foo" or "values.bar" changes
const { foo, bar } = use({ foo: "values.foo", bar: "values.bar" });
```

### Best Practices

Every time we get a value from the form state via the `use` method, it will listen the changes of the value and trigger re-renders only when necessary. Thus, there're some guidelines for us to use the form state. General speaking, **more frequently updated value(s), need to be accessed more specific, will get more performant**.

```js
const { use } = useForm();

// 👎🏻 You can, but not recommended because it will cause the component to update on every value change
const values = use("values");
// 👍🏻 For the form's values, we always recommended getting the target value as specific as possible
const fooValue = use("values.foo");

// 👍🏻 It's OK, in most case the form's validation will be triggered less frequently
const errors = use("errors");
// 👍🏻 But if a validation is triggered frequently, get the target error instead
const fooError = use("errors.foo");

// 👍🏻 It's OK, they are triggered less frequently
const [touched, dirty] = use(["touched", "dirty"]);
```

### Shortcut for Accessing the Form's Values

The form's values might be the most frequent one that we need to get in a specific way, it's kind of verbose. However there's a shortcut for it, we can get the form's values without the `values.` prefix:

```diff
// Current state: { values: { foo: "🍎", bar: "🍋", baz: "🥝" } }

-const [foo, bar, baz] = use(["values.foo", "values.bar", "values.baz"]);
+const [foo, bar, baz] = use(["foo", "bar", "baz"]);
```

### Missing Default Values?

If we didn't initialize the default value of a field via the [defaultValues option](../api-reference/use-form#defaultvalues) of the `useForm`. The `use` method will lose the value. Because the method is called before the field's initial render. For such cases, we can provide an alternative default value for the `use` method to return as below:

:::note
If you need to refer to the status of a [conditional field](../examples/conditional-fields), we recommend to use React state instead.
:::

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { form, use } = useForm({
    // Some options...
  });

  cosnole.log(use("values.foo")); // Returns undefined
  cosnole.log(use("values.foo", { defaultValues: { foo: "🍎" } })); // Returns "🍎"

  return (
    <form ref={form}>
      {/* The same case as the useControlled's defaultValue option */}
      <input name="foo" defaultValue="🍎" />
      <input type="submit" />
    </form>
  );
};
```

### Filter Untouched Field Errors

Error messages are dependent on the form's validation (i.e. the `errors` object). To avoid annoying the user by seeing an error message while typing, we can filter the errors of untouched fields by enable the `use`'s `errorWithTouched` option (default is `false`).

:::note
This feature filters any errors of the untouched fields. So when validating with the [runValidation](../api-reference/use-form#runvalidation), please ensure it's triggered after the field(s) is (are) touched.
:::

```js
const { use } = useForm();

// Current state: { errors: { foo: "Required" }, touched: {} }
// Returns { foo: "Required" }
const errors = use("errors");

// Current state: { errors: { foo: "Required" }, touched: {} }
// Returns {}
const errors = use("errors", { errorWithTouched: true });

// Current state: { errors: { foo: "Required" }, touched: { foo: true } }
// Returns { foo: "Required" }
const errors = use("errors", { errorWithTouched: true });
```

👉🏻 See the [Displaying Error Messages](./validation-guide#displaying-error-messages) to learn more about it.

## Isolating Re-rendering

Whenever a [monitored value](#watching-the-state) of the form state is updated, it will trigger re-renders. Re-renders are not bad but **slow re-renders** are (refer to the [article](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render#unnecessary-re-renders)). So, if you are building a complex form with large number of fields, you can isolate re-rendering at the component level via the [useFormState](../api-reference/use-form-state) hook for better performance. The hook has the similar API design to the `use` method that maintain a consistent DX for us.

:::note
We must provide a valid path to use the hook, or it will return `undefined`.
:::

[![Edit RCF - Isolating Re-rendering](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/intelligent-banach-uqxyx?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, useFormState } from "react-cool-form";

const checkStrength = (pwd) => {
  const passed = [/[$@$!%*#?&]/, /[A-Z]/, /[0-9]/, /[a-z]/].reduce(
    (cal, test) => cal + test.test(pwd),
    0
  );

  return { 1: "Weak", 2: "Good", 3: "Strong", 4: "Very strong" }[passed];
};

const FieldMessage = () => {
  // Supports single-value-pick, array-values-pick, object-values-pick, and shortcut-values-pick
  const [error, value] = useFormState(["errors.password", "password"]);

  return <p>{error || checkStrength(value)}</p>;
};

const App = () => {
  const {} = useForm({
    defaultValues: { password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form} noValidate>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
      />
      <FieldMessage />
      <input type="submit" />
    </form>
  );
};
```

## On State Change Event

The `useFormState` hook can also play as an event listener to listen for the changes to properties in the form state without triggering re-renders.

:::note
We must provide a valid path to use the hook, or the callback won't be triggered.
:::

```js
import { useForm, useFormState } from "react-cool-form";

const App = () => {
  const { form } = useForm({ defaultValues: { foo: "", bar: "" } });

  // Triggers callback when form's values changed
  useFormState("values", ({ foo, bar }) => console.log({ foo, bar }));
  // Triggers callback when a field value changed
  useFormState("foo", (foo) => console.log(foo));
  // Triggers callback when field values changed
  useFormState(["foo", "bar"], ([foo, bar]) => console.log([foo, bar]));

  return <form ref={form}>{/* Some fields... */}</form>;
};
```

## Reading the State

If you just want to read the form state without triggering re-renders, there's a [getState](../api-reference/use-form#getstate) method for you.

:::note
Please note, this method should be used in an event handler.
:::

```js {4}
const { getState } = useForm();

const SomeHandler = () => {
  const [isValid, values] = getState(["isValid", "values"]);

  if (isValid) createRecordOnServer(values);
};
```

With the method, we can read/construct the data by the following ways:

```js
const { getState } = useForm();

// Reading the form state
const state = getState();

// Reading a value of the form state
const foo = getState("values.foo");

// Shortcut for reading a value
const foo = getState("foo");

// Array pick
const [foo, bar] = getState(["values.foo", "values.bar"]);

// Object pick
const { foo, bar } = getState({ foo: "values.foo", bar: "values.bar" });
```
