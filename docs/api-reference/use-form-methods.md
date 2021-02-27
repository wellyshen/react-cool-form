---
id: use-form-methods
title: useFormMethods
---

This hook allows us to use all of the methods returned by the [useForm](./use-form#return-values) from a component at any level. Check the [Do It Yourself](../getting-started/3rd-party-ui-libraries#3-do-it-yourself) to learn more.

```js
const methods = useFormMethods(formId);
```

## formId

`string`

The [corresponding ID](../api-reference/use-form#id) of the `useForm` hook. We must provide it when using this hook.

## methods

All the methods that returned by the [useForm](./use-form#return-values).

## Example

The example demonstrates the basic usage of this hook.

```js
import { useFormMethods } from "react-cool-form";

const Field = ({ as, name, formId, ...restProps }) => {
  // Provide the corresponding ID of the "useForm" hook
  const { clearErrors, ...moreMethods } = useFormMethods(formId);
  const Component = as;

  return (
    <Component
      name={name}
      onFocus={(e) => {
        clearErrors(name);
        restProps.onFocus(e);
      }}
      {...restProps}
    />
  );
};
```
