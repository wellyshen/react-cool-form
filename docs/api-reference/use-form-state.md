---
id: use-form-state
title: useFormState
---

This hook can be used for two purposes:

- Isolating re-rendering: It helps us to isolate re-rendering at the component level for performance optimization (see [related article](https://overreacted.io/before-you-memo)). The API design similar to the [mon](../api-reference/use-form#mon) method of the `useForm` that maintain a consistent DX for us. See the [Isolating Re-rendering](../getting-started/form-state#isolating-re-rendering) to learn more.
- On state change event: To listen for changes to properties in the [form state](../getting-started/form-state#about-the-form-state) without triggering re-renders. See the [On State Change Event](../getting-started/form-state#on-state-change-event) to learn more.

```js
// Isolating re-rendering mode
const props = useFormState(path, config);

// On state change event mode
useFormState(path, callback, formId);
```

## Path

`string | string[] | Record<string, string>`

The path of the property we want to access from the [form state](../getting-started/form-state#about-the-form-state). We can construct the return values as follows.

- Every time an accessed value changed that will trigger re-renders. Thus, there're [some guidelines](../getting-started/form-state#best-practices) for us to use the form state.
- You can access the form's values without the `values.` prefix, ya! it's a shortcut for for your convenience.

```js
// Getting a value
const foo = useFormState("values.foo");

// Shortcut for getting a value
const foo = useFormState("foo");

// Array pick
const [foo, bar] = useFormState(["values.foo", "values.bar"]);

// Object pick
const { foo, bar } = useFormState({ foo: "values.foo", bar: "values.bar" });
```

## Config

An `object` with the following options:

### formId

`string`

The [corresponding ID](../api-reference/use-form#id) of the `useForm` hook. We only need it when using multiple form hooks at the same time.

### defaultValues

`FormValues`

The alternative default values for this hook to return when we didn't provide them via the [defaultValues option](./use-form#defaultvalues) of the `useForm`. Two common use cases of this option are as follows:

- Setting a default value for a field via the `defaultValue` attribute.
- Setting a default value for a field via the `useControlled`'s [defaultValue option](./use-controlled#defaultvalue).

### errorWithTouched

`boolean`

Enable/disable the feature of **filtering untouched errors**, which can help the user focus on typing without being annoyed by the error message. Default is `false`.

```js
// Current state: { errors: { foo: "Required" }, touched: { foo: false } }
// Returns { foo: "Required" }
const errors = useFormState("errors");

// Current state: { errors: { foo: "Required" }, touched: { foo: false } }
// Returns {}
const errors = useFormState("errors", { errorWithTouched: true );

// Current state: { errors: { foo: "Required" }, touched: { foo: true } }
// Returns { foo: "Required" }
const errors = useFormState("errors", { errorWithTouched: true );
```

## Callback

`(props: any) => void`

It's called on any of the subscribed properties in the [form state](../getting-started/form-state#about-the-form-state) change. It takes the properties as the parameter.

## FormId

`string`

An optional parameter that works the same as the [config.formId](#formid).

## Example

The example demonstrates the basic usage of this hook.

```js
import { useFormState } from "react-cool-form";

// To isolate re-rendering at the component level
const IsolatedComponent = () => {
  const foo = useFormState("foo");

  return <div>{foo}</div>;
};

// To listen for the changes of a field value
useFormState("foo", (foo) => console.log(foo));
```
