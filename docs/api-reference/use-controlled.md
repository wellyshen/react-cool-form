---
id: use-controlled
title: useControlled
---

This hook allows us to integrate with an existing component (usually a [controlled component](https://reactjs.org/docs/forms.html#controlled-components)) or 3rd-party UI library in React Cool Form. With this hook, we can easily to create a reusable controller component to fulfill our needs. Check the [useControlled Hook](../getting-started/3rd-party-ui-libraries#2-usecontrolled-hook) to learn more.

```js
const [fieldProps, meta] = useControlled(name, config);
```

## Name

`string`

The name of the field. We must provide it when using this hook.

## Config

An `object` with the following options:

### formId

`string`

The [corresponding ID](../api-reference/use-form#id) of the `useForm` hook. We only need it when using multiple form hooks at the same time.

### defaultValue

`string`

The default value of the field. Useful for dealing with the case of [conditional fields](../examples/conditional-fields).

### validation

`(value: any, values: FormValues) => any | Promise<any>`

A synchronous/asynchronous function that is used for the [field-level validation](../getting-started/validation-guide#field-level-validation).

### parse

`(...args: any[]) => any`

A function that takes the event object (or arguments) of the target component's `onChange` handler and parses the value of the field that you want to store into the [form state](../getting-started/form-state#about-the-form-state). Useful for data type converting.

### format

`(value: any) => any`

A function that takes the field's value from the [form state](../getting-started/form-state#about-the-form-state) and formats the value to give to the field. Usually used in conjunction with `parse`.

### errorWithTouched

`boolean`

Enable/disable the feature of **filtering untouched errors**, which can help the user focus on typing without being annoyed by the error message. Default is `false`.

```js
// Current state: { errors: { foo: "Required" }, touched: { foo: false } }
// Returns "Required"
const [, { error }] = useControlled("foo", {
  // Some options...
});

// Current state: { errors: { foo: "Required" }, touched: { foo: false } }
// Returns undefined
const [, { error }] = useControlled("foo", {
  errorWithTouched: true,
  // Other options...
});

// Current state: { errors: { foo: "Required" }, touched: { foo: true } }
// Returns "Required"
const [, { error }] = useControlled("foo", {
  errorWithTouched: true,
  // Other options...
});
```

### ...restProps

Any other props that will be spread into the `fieldProps`.

## Field Props

An `object` with the following properties:

### name

`string`

The name of the field.

### value

`any`

The value of the field.

### onChange

`(...event: any[]) => void`

An event handler called when the field's value changed.

### onBlur

`(e: React.FocusEvent) => void`

An event handler called when the field loses focus.

### ...restProps

Any other props that were passed to the `config`.

## Meta

An `object` with the following properties:

### error

`string | undefined`

The current validation error of the field.

### isTouched

`boolean`

To indicate whether the field has been touched/visited.

### isDirty

`boolean`

To indicate whether the field has been modified.

## Example

The example demonstrates the basic usage of this hook.

```js
import { useControlled } from "react-cool-form";

const Field = ({
  as,
  name,
  defaultValue,
  validate,
  parse,
  format,
  errorWithTouched,
  ...restProps
}) => {
  const [fieldProps, { error, isTouched, isDirty }] = useControlled(name, {
    defaultValue,
    validate,
    parse,
    format,
    errorWithTouched,
    ...restProps,
  });
  const Component = as;

  return <Component {...fieldProps} />;
};
```
