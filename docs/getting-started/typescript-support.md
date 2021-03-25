---
id: typescript-support
title: TypeScript Support
---

React Cool Form is written in [TypeScript](https://www.typescriptlang.org), so the library's types will always be up-to-date. When working with TypeScript, we can define a `FormValues` type to support the form's values.

[![Edit RCF - TypeScript](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-typescript-46x8n?fontsize=14&hidenavigation=1&theme=dark)

```tsx
import { useForm } from "react-cool-form";

interface FormValues {
  firstName: string;
  lastName: string;
}

const App = () => {
  const { form } = useForm<FormValues>({
    defaultValues: {
      firstName: "Welly",
      lastName: true, // 🙅🏻‍♀️ Type "boolean" is not assignable to type "string"
    },
    onSubmit: (values) => {
      console.log("First Name: ", values.firstName);
      console.log("Middle Name: ", values.middleName); // 🙅🏻‍♀️ Property "middleName" does not exist on type "FormValues"
    },
  });

  return (
    <form ref={form}>
      <input name="firstName" />
      <input name="lastName" />
      <input type="submit" />
    </form>
  );
};
```

## TypeScript and Hooks

We can provide the `FormValues` type to the following hooks:

```tsx
interface FormValues {
  firstName: string;
  lastName: string;
}

const methods = useForm<FormValues>();

const methods = useFormMethods<FormValues>();

const props = useFormState<FormValues>();

const props = useControlled<FormValues>();
Ｆ;
// Working without "validate" option
const props = useFieldArray<FieldValue>();
// Working with "validate" option
const props = useFieldArray<FieldValue, FormValues>({
  validate: (value) => {
    /* ... */
  },
});
```

## Making Field's Name Type-safe

Some folks are asking about the type-safe of a field's name, however we can achieve that via TypeScript's [Enums](https://www.typescriptlang.org/docs/handbook/enums.html).

```tsx
enum FieldNames {
  "fieldName.a[0].b" = "fieldName.a[0].b",
}

<input name={FieldNames["fieldName.a[0].c"]} />; // 👎🏻 Property "fieldName.a[0].c" does not exist on type "typeof FieldNames". Did you mean "fieldName.a[0].b"?
```

🧐 You can dig more useful [types](https://github.com/wellyshen/react-cool-form/blob/master/src/types/react-cool-form.d.ts) of this library to build a strongly typed form.
