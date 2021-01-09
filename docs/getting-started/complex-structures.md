---
id: complex-structures
title: Complex Structures
hide_table_of_contents: true
---

With React Cool Form you can use [dot](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Dot_notation)-and-[bracket](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Bracket_notation) notation as the name of a field to create arbitrarily deeply a fields. It's very similar to Lodash's [\_.set](https://lodash.com/docs/4.17.15#set) method.

> 💡 Setting `undefined` as a field value deletes the field data from the structure (see [related doc](../api-reference/use-form#setvalue)).

| Name         | Current structure                   | Value     | Result                      |
| ------------ | ----------------------------------- | --------- | --------------------------- |
| "foo"        | { }                                 | "rcf"     | { foo: "rcf" }              |
| "foo.bar"    | { }                                 | "rcf"     | { foo: { bar: "rcf" } }     |
| "foo[0]"     | { }                                 | "rcf"     | { foo: [ "rcf" ] }          |
| "foo[1]"     | { }                                 | "rcf"     | { foo: [ empty, "rcf" ] }   |
| "foo.0"      | { }                                 | "rcf"     | { foo: [ "rcf" ] }          |
| "foo[0].bar" | { }                                 | "rcf"     | { foo: [ { bar: "rcf" } ] } |
| "foo"        | { foo: "rcf" }                      | undefined | { }                         |
| "foo.bar"    | { foo: { bar: "rcf" }, baz: "rcf" } | undefined | { baz: "rcf" }              |
| "foo[0]"     | { foo: [ { bar: "rcf" } ] }         | undefined | { foo: [ empty ] }          |

You can play around with the following example to get better understanding of how it works:

[![Edit RCF - Complex Structures](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-complex-structures-4x4n1?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const FieldGroup = ({ name, onUpdate, onClear }) => (
  <>
    <input name={name} placeholder={name} />
    <div>
      <button type="button" onClick={onUpdate}>
        Update
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  </>
);

const App = () => {
  const { form, setValue } = useForm({
    defaultValues: {
      foo: "",
      bar: [],
      baz: { a: "" },
      qux: [{ a: "" }],
    },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <form ref={form}>
      <FieldGroup
        name="foo"
        onUpdate={() => setValue("foo", "rcf")}
        onClear={() => setValue("foo")}
      />
      <FieldGroup
        name="bar[0]"
        onUpdate={() => setValue("bar[0]", "🍋")}
        onClear={() => setValue("bar[0]")}
      />
      <FieldGroup
        name="baz.a"
        onUpdate={() => setValue("baz.a", "🍉")}
        onClear={() => setValue("baz.a")}
      />
      <FieldGroup
        name="qux[0].a"
        onUpdate={() => setValue("qux[0].a", "🥝")}
        onClear={() => setValue("qux[0].a")}
      />
      <input type="submit" />
    </form>
  );
};
```
