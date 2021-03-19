---
id: use-field-array
title: useFieldArray
---

This hook supplies you with functions for manipulating the array/list of fields, it's fast! See the [Arrays and Lists](../getting-started/arrays-and-lists) to learn more.

```js
const [fields, helpers] = useFieldArray(name, config);
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

## Fields

`FieldValue[]`

An array that holds the relevant field values. It refers to the location of the field in the [form state](../getting-started/form-state#about-the-form-state). If the referenced value isn't an `array` type, returns an empty array instead.

## Helpers

An `object` with the following methods:

### Push

`(value: FieldValue, options?: Object) => void`

Add a value to the end of an array.

```js
const handleAdd = () => {
  push(
    { id: "0", name: "Iron Man" },
    {
      shouldTouched: false, // Set the field as touched, default is false
      shouldDirty: true, // Set the field as dirty, default is true
    }
  );
};
```

### Insert

`(index: number, value: FieldValue, options?: Object) => void`

Insert a value at a given index into the array.

```js
const handleInsert = () => {
  insert(
    0,
    { id: "0", name: "Iron Man" },
    {
      shouldTouched: false, // Set the field as touched, default is false
      shouldDirty: true, // Set the field as dirty, default is true
    }
  );
};
```

### Swap

`(indexA: number, indexB: number) => void`

Swap two values in an array.

### Move

`(from: number, to: number) => void`

Move a value in an array to another index.

### Remove

`(index: number) => FieldValue`

Remove a value at an index of an array and return it.

## Example

The example demonstrates the basic usage of this hook.

> 💡 When dealing with array fields, we don’t recommend using indexes for keys if the order of fields may change. Check out the [article](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318) to learn more.

```js
import { useForm, useFieldArray } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    defaultValues: { foo: [{ id: "0", name: "Iron Man" }] },
  });
  const [fields, { push, insert, move, swap, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map(({ id, name }, index) => (
        <input
          key={id}
          name={`foo[${index}].name`}
          defaultValue={name} // We need to provide the default value
        />
      ))}
    </form>
  );
};
```
