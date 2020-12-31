---
id: complex-structures
title: Complex Structures
hide_table_of_contents: true
---

With React Cool Form you can use [dot](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Dot_notation)-and-[bracket](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#Bracket_notation) notation as the name of a field to create arbitrarily deeply nested fields. It's very similar to Lodash's [\_.set](https://lodash.com/docs/4.17.15#set) method.

> 💡 Setting `undefined` as a field value, will delete the field data from the structure (see [related doc](../api-reference/use-form#setfieldvalue)).

| Name       | Current structure                     | Value     | Result                       |
| ---------- | ------------------------------------- | --------- | ---------------------------- |
| foo        | { }                                   | "test"    | { foo: "test" }              |
| foo.bar    | { }                                   | "test"    | { foo: { bar: "test" } }     |
| foo[0]     | { }                                   | "test"    | { foo: [ "test" ] }          |
| foo[1]     | { }                                   | "test"    | { foo: [ empty, "test" ] }   |
| foo.0      | { }                                   | "test"    | { foo: [ "test" ] }          |
| foo[0].bar | { }                                   | "test"    | { foo: [ { bar: "test" } ] } |
| foo        | { foo: "test" }                       | undefined | { }                          |
| foo.bar    | { foo: { bar: "test" }, baz: "test" } | undefined | { baz: "test" }              |
| foo[0]     | { foo: [ { bar: "test" } ] }          | undefined | { foo: [ empty ] }           |

You can play around with the following example to get better understanding of how it works:

```js
Coming soon...
```
