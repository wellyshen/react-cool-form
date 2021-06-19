---
id: arrays-and-lists
title: Arrays and Lists
---

There can be situations in which the user needs to add or remove fields from a form depends on the amount of fields they need to fill out. Using React Cool Form, we can use the [useFieldArray](../api-reference/use-field-array) hook to easily deal with this situation.

## Dealing with Array Fields

The `useFieldArray` hook helps you to deal with multiple similar fields. You pass it a `name` parameter with the path of the field that holds the relevant array. The hook will then give you the power to render an array of inputs as well as common array/list manipulations.

:::note
The returned `fields` is an array of names. If you need to access the field's data, use the [use](../api-reference/use-form#use) or [getState](../api-reference/use-form#getstate) methods.
:::

[![Edit RCF - Arrays and Lists](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-arrays-and-lists-crv9d?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm, useFieldArray } from "react-cool-form";

const TextField = ({ name, ...restProps }) => {
  const [fieldProps] = useControlled(name, restProps);
  return <input {...fieldProps} />;
};

const App = () => {
  const { form } = useForm({
    defaultValues: {
      foo: [{ name: "Iron Man" }, { name: "Hulk" }],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push, insert, move, swap, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {/* The first parameter of the callback supplies you a field name (e.g. foo[0], foo[1]) */}
      {fields.map((fieldName, index) => (
        // Use the "fieldName" as the key
        <div key={fieldName}>
          {/* Use the "fieldName" + "YOUR PATH" as the name */}
          <input name={`${fieldName}.name`} />
          {/* Working with a controlled component */}
          <TextField name={`${fieldName}.name`} />
          <button type="button" onClick={() => remove(index)}>
            ➖
          </button>
        </div>
      ))}
      <button type="button" onClick={() => push({ name: "Thor" })}>
        ➕
      </button>
      <input type="submit" />
    </form>
  );
};
```

## Applying Focus

When dealing with dynamic list fields we can apply focus to a new field by the [focus](../api-reference/use-form#focus) method to provide better for the user.

:::tip
When working with nested fields, we can just pass in the parent path to the `focus` method. It will apply the focus to the first field.
:::

```js {28,30}
import { useForm, useFieldArray } from "react-cool-form";

const App = () => {
  const { form, focus } = useForm({
    defaultValues: {
      foo: [{ name: "Iron Man", quote: "I'm Iron Man" }],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map((fieldName, index) => (
        <div key={fieldName}>
          <input name={`${fieldName}.name`} />
          <input name={`${fieldName}.quote`} />
          <button type="button" onClick={() => remove(index)}>
            ➖
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          push({ name: "Thor", quote: "I Knew It" });
          // We need to wait for the item rendered (delay = 0 is acceptable) then apply focus to the first field
          focus(`foo[${fields.length}]`, 300);
          // You can also apply focus to a specified field
          focus(`foo[${fields.length}].quote`, 300);
        }}
      >
        ➕
      </button>
      <input type="submit" />
    </form>
  );
};
```

## Conditional Fields

The `useFieldArray` hook also supports you to work with conditional fields.

```js
import { useState } from "react";
import { useForm, useFieldArray } from "react-cool-form";

const TextField = ({ name, ...restProps }) => {
  const [fieldProps] = useControlled(name, restProps);
  return <input {...fieldProps} />;
};

const App = () => {
  const [toggle, setToggle] = useState(false);
  const { form } = useForm({
    defaultValues: { foo: [{ name: "Iron Man" }] },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map((fieldName) => (
        <div key={fieldName}>
          <input name={`${fieldName}.name`} />
          {toggle && (
            <input
              name={`${fieldName}.quote`}
              defaultValue="I'm Iron Man" // Provide the default value
            />
          )}
          <TextField name={`${fieldName}.name`} />
          {toggle && (
            <TextField
              name={`${fieldName}.quote`}
              defaultValue="I'm Iron Man" // Provide the default value
            />
          )}
        </div>
      ))}
      <button type="button" onClick={() => setToggle(!toggle)}>
        Toggle
      </button>
      <input type="submit" />
    </form>
  );
};
```

## Top-level Field Validation

You can validate the top-level field via the [Form-level Validation](./validation-guide#form-level-validation) or [Field-level Validation](./validation-guide#field-level-validation) (via the `validate` option), depending on your case. React Cool Form runs validation after any array manipulations.

```js {6-12,18-19}
import { useForm, useFieldArray } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    // Form-level validation
    validate: ({ foo }) => {
      const errors = {};

      if (!foo.length) errors.foo = "We need a super hero!";

      return errors;
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });
  const [fields, { push, remove }] = useFieldArray("foo", {
    // Field-level validation
    validate: (value, values /* Form values */) =>
      !foo.length ? "We need a super hero!" : false,
  });

  return (
    <form ref={form} noValidate>
      {fields.map((fieldName, index) => (
        <div key={fieldName}>
          <input name={`${fieldName}.name`} />
          <button type="button" onClick={() => remove(index)}>
            ➖
          </button>
        </div>
      ))}
      <button type="button" onClick={() => push({ name: "Thor" })}>
        ➕
      </button>
      <input type="submit" />
    </form>
  );
};
```
