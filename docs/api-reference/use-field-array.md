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

`string[]`

An array that holds field names (e.g. `foo[0]`, `foo[1]`), which can be used for the `key` and `name` attributes of a field.

- It refers to the location of the field in the [form state](../getting-started/form-state#about-the-form-state). If the referenced value isn't an `array` type, returns an empty array instead.

```js
const [fields] = useFieldArray("foo", { defaultValue: [{ name: "Iron Man" }] });

// The first parameter of the callback supplies you a field name (e.g. foo[0], foo[1])
fields.map((fieldName) => (
  <input
    key={fieldName} // Use the "fieldName" as the key
    name={`${fieldName}.name`} // Use the "fieldName" + "YOUR PATH" as the name
  />
));
```

## Helpers

An `object` with the following methods:

### push

`(value: FieldValue, options?: Object) => void`

Add a value to the end of an array.

```js
const handleAdd = () => {
  push(
    { name: "Iron Man" },
    {
      shouldTouched: false, // (Default = false) Set the field as touched
      shouldDirty: true, // (Default = true) Set the field as dirty
    }
  );
};
```

### insert

`(index: number, value: FieldValue, options?: Object) => void`

Insert an element at a given index into the array.

```js
const handleInsert = () => {
  insert(
    0,
    { name: "Iron Man" },
    {
      shouldTouched: false, // (Default = false) Set the field as touched
      shouldDirty: true, // (Default = true) Set the field as dirty
    }
  );
};
```

### swap

`(indexA: number, indexB: number) => void`

Swap two values in an array.

### move

`(from: number, to: number) => void`

Move an element in an array to another index.

### remove

`(index: number) => FieldValue`

Remove an element at an index of an array and return it.

## Example

The example demonstrates the basic usage of this hook.

```js
import { useForm, useFieldArray } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    defaultValues: { foo: [{ name: "Iron Man" }] },
  });
  const [fields, { push, insert, move, swap, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {/* The first parameter of the callback supplies you a field name (e.g. foo[0], foo[1]) */}
      {fields.map((fieldName) => (
        <input
          key={fieldName} // Use the "fieldName" as the key
          name={`${fieldName}.name`} // Use the "fieldName" + "YOUR PATH" as the name
        />
      ))}
    </form>
  );
};
```
