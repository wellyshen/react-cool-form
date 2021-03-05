---
id: utility-functions
title: Utility Functions
---

React Cool Form exports useful utility functions that can help you handle [complex structures](../getting-started/complex-structures) efficiently.

```js
import { get, set, unset } from "react-cool-form";
```

## get

`(object: Record<string, any>, path: string, defaultValue?: unknown) => any`

Gets the value at path of object. If the resolved value is `undefined`, the `defaultValue` is returned in its place.

```js {8}
import { useForm, get } from "react-cool-form";

const { form } = useForm({
  defaultValues: { foo: { bar: { baz: "" } } },
  validate: (values) => {
    const errors = {};

    if (!get(values, "foo.bar.baz", "")) errors.foo.bar.baz = "Required";

    return errors;
  },

  // ...
});
```

## set

`(object: Record<string, any>, path: string, value: unknown, immutable?: boolean) => any`

Sets the value at `path` of `object`. If a portion of `path` doesn't exist, it's created. Arrays are created for missing index properties while objects are created for all other missing properties.

```js {10,12}
import { useForm, set } from "react-cool-form";

const { form } = useForm({
  defaultValues: { foo: { bar: { baz: "" } } },
  validate: (values) => {
    const errors = {};

    if (!values.foo.bar.baz) {
      // Mutable way
      set(errors, "foo.bar.baz", "Required");
      // Immutable way
      errors = set(errors, "foo.bar.baz", "Required", true);
    }

    return errors;
  },

  // ...
});
```

## unset

`(object: Record<string, any>, path: string, immutable?: boolean) => any`

Removes the property at `path` of `object`. If the remaining property is empty, the ancestry path of the property will be removed as well.

```js {12,14}
import { useForm, unset } from "react-cool-form";

const { form } = useForm({
  defaultValues: { foo: { bar: { baz: "" } } },
  validate: (values) => {
    const errors = {};

    if (!values.foo.bar.baz) {
      // ...
    } else {
      // Mutable way
      unset(errors, "foo.bar.baz");
      // Immutable way
      errors = unset(errors, "foo.bar.baz", true);
    }

    return errors;
  },

  // ...
});
```
