---
id: use-form
title: useForm
---

This is a custom React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that helps you with building forms. It takes `config` arguments and returns useful methods as follows.

```js
const returnValues = useForm(config);
```

## Config

An `object` with the following options:

### defaultValues

`Record<string, any>`

Default field values of the form. In most case (especially working with TypeScript), we should use it to initialize a field's value and use the [defaultValue/defaultChecked](https://reactjs.org/docs/uncontrolled-components.html#default-values) attribute for the case of [conditional fields](../examples/conditional-fields). The `defaultValues` also used to compare against the current values to calculate `isDirty` and `dirtyFields`.

> 💡 The `defaultValues` is cached **at the first render** within the custom hook. If you want to reset it or [lazily set it](../examples/lazy-default-values), you can use the [reset](#reset) method.

### ignoreFields

`string[]`

Tell React Cool Form to ignore field(s) by passing in the `name` of the field. You can also ignore a field via the pre-defined `data-rcf-ignore` attribute. Check the [Ignore Fields](../getting-started/integration-an-existing-form#ignore-fields) to learn more.

### removeUnmountedField

`boolean`

By default, React Cool Form auto removes the related state (i.e. `values`, `errors`, `touched`, `dirtyFields`) of an unmounted field for us. However, we can set the `removeUnmountedField` to `false` to maintain the state. Check the [conditional fields](../examples/conditional-fields) example to learn more. Default is `true`.

### builtInValidationMode

Coming soon...

### validateOnChange

`boolean`

Tell React Cool Form to run validations on `change` events as well as the [setFieldValue](#setfieldvalue) and [setValues](#setvalues) methods. Default is `true`.

### validateOnBlur

`boolean`

Tell React Cool Form to run validations on `blur` events. Default is `true`.

### validate

Coming soon...

### onSubmit

Coming soon...

### onError

Coming soon...

### onReset

Coming soon...

### debug

Coming soon...

## Return Values

An `object` with the following methods:

### form

`React.MutableRefObject`

A React [ref](https://reactjs.org/docs/hooks-reference.html#useref) that allows you to [integrate a form with React Cool Form](./../getting-started/integration-an-existing-form).

### field

Coming soon...

### getState

Coming soon...

### setValues

Coming soon...

### setFieldValue

Coming soon...

### setErrors

Coming soon...

### setFieldError

Coming soon...

### validateForm

Coming soon...

### validateField

Coming soon...

### submit

Coming soon...

### reset

`(values?: FormValues | PreviousValuesFn<FormValues> | null, exclude?: string[] | null, e?: Event) => void`

Coming soon...

### controller

Coming soon...
