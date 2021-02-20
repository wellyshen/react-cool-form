---
id: use-form-state
title: useFormState
---

`(path: string | string[] | Record<string, string>, options: Object) => any`

This is a custom React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that helps us to isolate re-rendering at the component level for performance optimization, especially when building a complex form with large number of fields.

The hook has the similar API design to the [select](../api-reference/use-form#select) method of the `useForm` hook that maintain a consistent DX for us. Check the [Isolating Re-rendering](../getting-started/form-state#isolating-re-rendering) to learn more.
