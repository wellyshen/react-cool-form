---
id: integration-an-existing-form
title: Integration an Existing Form
---

"Easy to use" is one of the core design principles of React Cool Form, the library is built on top of React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook). So it's easy to be integrated with an existing form without too much effort.

## Hook into A Form

To use React Cool Form, we just need to attach the [form](../api-reference/use-form#form) method to the target element via the `ref` attribute. It acts as a **delegator** that will take care of all the values of [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) for us.

[![Edit RCF - Basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-basic-17fz0?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const Field = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
);

const Select = ({ label, id, children, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <select id={id} {...rest}>
      {children}
    </select>
  </div>
);

const Textarea = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} {...rest} />
  </div>
);

const App = () => {
  const { form } = useForm({
    // (Strongly advise) Provide the default values just like we use React state
    defaultValues: { firstName: "", lastName: "", framework: "", message: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    // We can use "noValidate" to disable browser's interactive validation
    <form ref={form} noValidate>
      <Field label="First Name" id="first-name" name="firstName" />
      <Field label="Last Name" id="last-name" name="lastName" />
      <Select label="Framework" id="framework" name="framework">
        <option value="">I'm interesting in...</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </Select>
      <Textarea label="Message" id="message" name="message" />
      <input type="submit" />
    </form>
  );
};
```

If you need to use the `ref` of form for other purpose, you can share the `ref` by the following way:

```js {10}
import { useRef } from "react";
import { useForm } from "react-cool-form";

const App = () => {
  const formRef = useRef();
  const { form } = useForm();

  const setRef = (element) => {
    if (element) {
      formRef.current = element;
      form(element);
    }
  };

  return <form ref={form}>{/* Some fields... */}</form>;
};
```

## Without Using a `<form>` Element

React Cool Form is not limited to actual forms. It can be used with any container where inputs are used.

```js {10,14}
import { useForm } from "react-cool-form";

const App = () => {
  const { form, submit } = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: (values) => console.log("onSubmit: ", values),
  });

  return (
    <div ref={div}>
      <input name="email" required />
      <input name="password" required minLength={8} />
      {/* We need to manually submit the form */}
      <button onClick={submit}>Submit</button>
    </div>
  );
};
```

## Exclude Fields

You can tell React Cool Form to exclude field(s) via the pre-defined `data-rcf-exclude` attribute or the [excludeFields](../api-reference/use-form#excludefields) option, depends on your case.

[![Edit RCF - Conditional Fields](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rcf-conditional-fields-rnxe6?fontsize=14&hidenavigation=1&theme=dark)

```js {7,20}
import { useState } from "react";
import { useForm } from "react-cool-form";

const App = () => {
  const { from } = useForm({
    defaultValues: { username: "", email: "" },
    // excludeFields: ["more"], // You can also exclude the fields by this option
    onSubmit: (values) => console.log("onSubmit: ", values),
  });
  const [toggle, setToggle] = useState(false);

  return (
    <form ref={form}>
      <input name="username" />
      <input name="email" type="email" />
      <input
        name="more" // Used for the "excludeFields" option
        type="checkbox"
        onChange={() => setToggle(!toggle)}
        data-rcf-exclude // Exclude the fields via the pre-defined data attribute
      />
      {toggle && (
        <>
          <input name="option" type="radio" value="🍎" defaultChecked />
          <input name="option" type="radio" value="🥝" />
          <input name="option" type="radio" value="🍋" />
        </>
      )}
    </form>
  );
};
```
