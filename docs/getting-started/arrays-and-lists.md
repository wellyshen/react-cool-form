---
id: arrays-and-lists
title: Arrays and Lists
---

There can be situations in which the user needs to add or remove fields from a form depending on the amount of fields they need to fill out. Using React Cool Form, we can use the [useFieldArray](../api-reference/use-field-array) hook to easily deal with this situation.

## Deal with Field Array

The `useFieldArray` hook helps you to deal with multiple similar fields. You pass it a `name` parameter with the path of the field that holds the relevant array. The hook will then give you the power to render an array of inputs as well as common array/list manipulations.

> 💡 When dealing with field array, we don’t recommend using indexes for keys if the order of fields may change. Check out the [article](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318) to learn more.

```js
import { useForm, useFieldArray } from "react-cool-form";

const Field = ({ name, ...restProps }) => {
  const [fieldProps] = useControlled(name, restProps);
  return <input {...fieldProps} />;
};

const App = () => {
  const { form } = useForm({
    defaultValues: {
      foo: [
        { id: "0", name: "Iron Man" },
        { id: "1", name: "Hulk" },
      ],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [fields, { push, insert, move, swap, remove }] = useFieldArray("foo");

  return (
    <form ref={form}>
      {fields.map(({ id, name }, index) => (
        <div key={id}>
          <input
            name={`foo[${index}].name`}
            defaultValue={name} // We need to provide the default value
          />
          {/* Working with a controlled component */}
          <Field
            name={`foo[${index}].name`}
            defaultValue={name} // We need to provide the default value
          />
          <button type="button" onClick={() => remove(index)}>
            ➖
          </button>
        </div>
      ))}
      <button type="button" onClick={() => push({ id: "2", name: "Thor" })}>
        ➕
      </button>
      <input type="submit" />
    </form>
  );
};
```

## Validate the Field

You can validate the top-level field via the [Form-level Validation](./validation-guide#form-level-validation) or [Field-level Validation](./validation-guide#field-level-validation), depends on your case. React Cool Form runs validation after any array manipulations.

```js
import { useForm, useFieldArray } from "react-cool-form";

const App = () => {
  const { form } = useForm({
    validate: ({ foo }) => {
      const errors = {};

      if (!foo.length) errors.foo = "We need a super hero!";

      return errors;
    }
    onSubmit: (values) => console.log("onSubmit: ", values),
    onError: (errors) => console.log("onError: ", errors),
  });
  const [fields, { push, remove }] = useFieldArray("foo", {
    validate: (value, values /* Form values */) => !foo.length ? "We need a super hero!" : false,
  });

  return (
    <form ref={form} noValidate>
      {fields.map(({ id, name }, index) => (
        <div key={id}>
          <input name={`foo[${index}].name`} defaultValue={name} />
          <button type="button" onClick={() => remove(index)}>
            ➖
          </button>
        </div>
      ))}
      <button type="button" onClick={() => push({ id: "2", name: "Thor" })}>
        ➕
      </button>
      <input type="submit" />
    </form>
  );
};
```
