---
id: use-form-state
title: useFormState
---

`(path: string | string[] | Record<string, string>, options: Object) => any`

This is a custom React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that helps us to isolate re-rendering at the component level for performance optimization, especially when building a complex form with large number of fields.

The hook has the similar API design to the [select](../api-reference/use-form#select) method of the `useForm` hook that maintain a consistent DX for us.

```js
import { useFormState } from "react-cool-form";

const IsolatedComponent = () => {
  // Getting the "values.foo" value, it also supports array-pick and object-pick data formats
  // Array-pick: useFormState(["foo", "bar"], { ... })
  // Object-pick: useFormState({ foo: "foo", bar: "bar" }, { ... })
  const foo = useFormState("foo", {
    formId: "form-1", // We must provide the corresponding ID of "useForm" hook
    target: "values", // (Optional) To get the values of a specific target, e.g. values, errors etc.
    errorWithTouched: true, // (Optional) To filter the errors of untouched fields
  });

  return <div>{foo}</div>;
};
```

👉🏻 Check the [Isolating Re-rendering](../getting-started/form-state#isolating-re-rendering) to learn more.
