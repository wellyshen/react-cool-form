---
id: use-form-methods
title: useFormMethods
---

This hook allows us to use [all of the methods](./use-form#methods) provided by React Cool Form from a component at any level. Check the [Do It Yourself](../getting-started/3rd-party-ui-libraries#3-do-it-yourself) to learn more.

```js
const methods = useFormMethods(formId);
```

## formId

`string`

The [corresponding ID](../api-reference/use-form#id) of the `useForm` hook. We must provide it when using this hook.

## methods

The [methods](./use-form#methods) are the same as the `useForm` hook.

## Example

The example demonstrates the basic usage of this hook.

```js
import { useFormMethods } from "react-cool-form";

const Field = ({ as, name, formId, onFocus, ...restProps }) => {
  // Provide the corresponding ID of the "useForm" hook
  const { clearErrors, ...moreMethods } = useFormMethods(formId);
  const Component = as;

  return (
    <Component
      name={name}
      onFocus={(e) => {
        clearErrors(name);
        onFocus(e);
      }}
      {...restProps}
    />
  );
};
```
