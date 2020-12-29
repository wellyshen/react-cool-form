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

> 💡 If the field isn't a form input element (i.e. [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)) or [controller](#controller)'s target. We need to clear the related state by ourselves via `set`-related methods.

### builtInValidationMode

`"message" | "state" | false`

We can configure the [mode of the built-in validation](../getting-started/validation-guide#displaying-error-messages) as follows:

- `"message"` (default): Returns [a localized message](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage) that describes the validation constraints that the field does not satisfy (if any)
- `"state"`: Returns the "key" of the invalid property of the [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) (if any)
- `false`: Disable the [built-in validation](../getting-started/validation-guide#built-in-validation)

### validateOnChange

`boolean`

Tell React Cool Form to run validations on `change` events as well as the [setFieldValue](#setfieldvalue) and [setValues](#setvalues) methods. Default is `true`.

### validateOnBlur

`boolean`

Tell React Cool Form to run validations on `blur` events. Default is `true`.

### validate

`(values: FormValues) => FormErrors<FormValues> | void | Promise<FormErrors<FormValues> | void>`

A synchronous/asynchronous function that is used for the [form-level validation](../getting-started/validation-guide#form-level-validation). It takes all the `values` of the form and returns any validation errors (or returns `undefined` if there's no error). The validation errors must be in the same shape as the values of the form.

### onSubmit

`(values: FormValues, options: Options<FormValues>, e?: Event) => void | Promise<void>`

The form submission handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated successfully. It takes the following arguments:

```js
const returnValues = useForm({
  onSubmit: async (values, options, e) => {
    const {
      formState, // The current form state, don't mutate it directly
      setValues,
      setFieldValue,
      setErrors,
      setFieldError,
      validateForm,
      validateField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

Check the [Form Submission](../getting-started/form-submission) to learn more.

### onError

`(errors: FormErrors<FormValues>, options: Options<FormValues>, e?: Event) => void`

The form error handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated failed. It takes the following arguments:

```js
const returnValues = useForm({
  onError: (errors, options, e) => {
    const {
      formState, // The current form state, don't mutate it directly
      setValues,
      setFieldValue,
      setErrors,
      setFieldError,
      validateForm,
      validateField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

Check the [Form Submission](../getting-started/form-submission) to learn more.

### onReset

`(values: FormValues, options: Options<FormValues>, e?: Event) => void`

The form reset handler that is called when the form is reset (or when the [reset](#reset) method is called). It takes the following arguments:

```js
const returnValues = useForm({
  onReset: (values, options, e) => {
    const {
      formState, // The current form state, don't mutate it directly
      setValues,
      setFieldValue,
      setErrors,
      setFieldError,
      validateForm,
      validateField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

Check the [Reset Form](../getting-started/reset-form) to learn more.

### debug

A callback for debugging that receives the form state. It's called on every state change.

```js
const returnValues = useForm({
  debug: (formState) => console.log("Form State: ", formState),
});
```

## Return Values

An `object` with the following methods:

### form

`React.MutableRefObject`

A React [ref](https://reactjs.org/docs/hooks-reference.html#useref) that allows you to [integrate a form with React Cool Form](./../getting-started/integration-an-existing-form).

### field

Coming soon...

### getState

`(path: string | string[] | Record<string, string>, options?: { target?: string; watch?: boolean; filterUntouchedError?: boolean; }) => any`

This method provides us a permanent way to use the [form state](../getting-started/form-state).

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

`(values?: FormValues | ((prevValues: FormValues) => FormValues) | null, exclude?: string[] | null, e?: Event) => void`

Coming soon...

### controller

Coming soon...
