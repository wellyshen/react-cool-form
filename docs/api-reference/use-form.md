---
id: use-form
title: useForm
---

This is a custom React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that helps you with building forms. It takes `config` parameters and returns useful methods as follows.

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

> 💡 The `ignoreFields` and `data-rcf-ignore` won't affect the operation of the [controller](#controller).

### shouldRemoveField

`boolean`

By default, React Cool Form auto removes the related state (i.e. `values`, `errors`, `touched`, `dirtyFields`) of an unmounted field for us. However, we can set the `shouldRemoveField` to `false` to maintain the state. Check the [conditional fields](../examples/conditional-fields) example to learn more. Default is `true`.

> 💡 If the field isn't a form input element (i.e. [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)) or [controller](#controller)'s target. We need to clear the related state by ourselves via `set`-related methods.

### builtInValidationMode

`"message" | "state" | false`

We can configure the [mode of the built-in validation](../getting-started/validation-guide#displaying-error-messages) as follows:

- `"message"` (default): Returns [a localized message](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage) that describes the validation constraints that the field does not satisfy (if any)
- `"state"`: Returns the **key of the invalid property** (e.g. "valueMissing", "tooShort" etc.) of the [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) (if any)
- `false`: Disable the [built-in validation](../getting-started/validation-guide#built-in-validation)

### validateOnChange

`boolean`

Tell React Cool Form to run validations on `change` events as well as the [setFieldValue](#setfieldvalue) and [setValues](#setvalues) methods. Default is `true`.

### validateOnBlur

`boolean`

Tell React Cool Form to run validations on `blur` events. Default is `true`.

### validate

`(values: FormValues) => FormErrors | void | Promise<FormErrors | void>`

A synchronous/asynchronous function that is used for the [form-level validation](../getting-started/validation-guide#form-level-validation). It takes all the `values` of the form and returns any validation errors (or returns `undefined` if there's no error). The validation errors must be in the same shape as the values of the form.

### onSubmit

`(values: FormValues, options: Object, e?: Event) => void | Promise<void>`

The form submission handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated successfully. It takes the following parameters:

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

`(errors: FormErrors, options: Object, e?: Event) => void`

The form error handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated failed. It takes the following parameters:

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

`(values: FormValues, options: Object, e?: Event) => void`

The form reset handler that is called when the form is reset (or when the [reset](#reset) method is called). It takes the following parameters:

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
  debug: (formState) => console.log("Debug: ", formState),
});
```

## Return Values

An `object` with the following methods:

### form

`React.RefObject`

A React [ref](https://reactjs.org/docs/hooks-reference.html#useref) that allows you to [integrate a form with React Cool Form](./../getting-started/integration-an-existing-form).

### field

`(validateOrOptions: Function | Object) => Function`

This method allows us to do [field-level validation](../getting-started/validation-guide#field-level-validation) and data type conversion via the `ref` attribute. For the data type conversion, React Cool Form supports the [valueAsNumber](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasnumber), [valueAsDate](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasdate), and custom parser.

> 💡 For your convenience, the values of `<input type="number">` and `<input type="radio">` are converted to `number` by default.

```js
const { field } = useForm();

<input
  name="rcf"
  type="date"
  ref={field({
    validate: (value, values /* Form values */) => !value.length && "Required",
    valueAsNumber: true, // (Default = false) Returns a number representing the field's value if applicable, otherwise, returns "NaN"
    valueAsDate: true, // (Default = false) Returns a Date object representing the field's value if applicable, otherwise, returns "null"
    parse: (value) => customParser(value), // Returns whatever value you want through the callback
  })}
/>;
```

If you just want to validate the field, there's a shortcut for it:

```js
<input nam="rcf" ref={field((value) => !value.length && "Required")} />
```

### getState

`(path: string | string[] | Record<string, string>, options?: Object) => any`

This method provides us a performant way to use/read the form state. Check the [Form State](../getting-started/form-state) document to learn more.

### setValues

`(values: FormValues | Function, options?: Object) => void`

This method allows us to manually set the `values` of the [form state](../getting-started/form-state).

```js
const { setValues } = useForm();

setValues(
  { firstName: "Welly", lastName: "Shen" }, // It will replace the entire values object
  {
    shouldValidate: true, // (Default = "validateOnChange" option) Triggers form validation
    touchedFields: ["firstName"], // Sets fields as touched by passing their names
    // touchedFields: (allFieldNames) => allFieldNames, // A reverse way to set touched fields
    dirtyFields: ["firstName"], // Sets fields as dirty by passing their names
    // dirtyFields: (allFieldNames) => allFieldNames, // A reverse way to set dirty fields
  }
);

// We can also pass a callback as the "values" parameter, similar to React's setState callback style
setValues((prevValues) => ({ ...prevValues, firstName: "Bella" }));
```

### setFieldValue

`(name: string, value?: any | Function, options?: Object) => void`

This method allows us to manually set/clear the value of a field. Useful for creating custom field change handlers.

```js
const { setFieldValue } = useForm();

setFieldValue("fieldName", "value", {
  shouldValidate: true, // (Default = "validateOnChange" option) Triggers field validation
  shouldTouched: true, // (Default = true) Sets the field as touched
  shouldDirty: true, // (Default = true) Sets the field as dirty
});

// We can also pass a callback as the "value" parameter, similar to React's setState callback style
setFieldValue("fieldName", (prevValue) => prevValue.splice(2, 0, "🍎"));
```

We can clear the value of a field as the following way:

```js
setFieldValue("fieldName"); // The field will be unset: { fieldName: "value" } → {}
// or
setFieldValue("fieldName", undefined);
```

### setErrors

`(errors?: FormErrors | Function) => void`

This method allows us to manually set/clear the `errors` of the [form state](../getting-started/form-state).

```js
const { setErrors } = useForm();

setErrors({ firstName: "Required", lastName: "Required" });

// We can also pass a callback as the "errors" parameter, similar to React's setState callback style
setErrors((prevErrors) => ({ ...prevErrors, firstName: "Required" }));
```

We can clear the `errors` of the form state as the following way:

```js
setErrors();
// or
setErrors(undefined); // Works with any falsy values
```

### setFieldError

`(name: string, error?: any | Function) => void`

This method allows us to manually set/clear the error of a field. Useful for creating custom field error handlers.

```js
const { setFieldError } = useForm();

setFieldError("fieldName", "Required");

// We can also pass a callback as the "error" parameter, similar to React's setState callback style
setFieldError("fieldName", (prevError) =>
  prevError ? "Too short" : "Required"
);
```

We can clear the error of a field as the following way:

```js
setFieldError("fieldName"); // The error will be unset: { fieldName: "Required" } → {}
// or
setFieldError("fieldName", undefined); // Works with any falsy values
```

### validateForm

`() => Promise<FormErrors>`

This method allows us to manually run validation for the form, it returns the `errors` of the [form state](../getting-started/form-state#about-the-form-state). Check the [Validation Guide](../getting-started/validation-guide) document to learn more.

### validateField

`(name: string) => Promise<any>`

This method allows us to manually run validation for a single field, it returns an error if any. Check the [Validation Guide](../getting-started/validation-guide) document to learn more.

### submit

`(e?: Event) => Promise<{ values?: FormValues, errors?: FormErrors }>`

This method allows us to manually submit the form, it returns a promise with the following results. Useful for meeting the needs of custom design.

- Returns `errors` if there're any validation errors
- Returns `values` if the form is validated successfully

```js
const { submit } = useForm({
  onSubmit: (values, options, e) => console.log("onSubmit: ", values), // Triggered on form submit + valid
  onError: (errors, options, e) => console.log("onError: ", errors), // Triggered on form submit + invalid
});

const handleFormSubmit = async (e) => {
  const {} = await submit(e); // Pass the event object to the event handlers

  if (errors) {
    // Do something for invalid case
  } else {
    // Do something for valid case
  }
};
```

Check the [Form Submission](../getting-started/form-submission) to learn more.

### reset

`(values?: FormValues | Function | null, exclude?: string[] | null, e?: Event) => void`

This method allows us to manually reset the form. It will restore the form to its default values as well as reset/clear all the [related state](../getting-started/form-state#about-the-form-state).

- We can pass `values` as an optional parameter to update the default values.
- We can pass `exclude` as an optional parameter to prevent specific state from reset.

```js
const { reset } = useForm({
  defaultValues: { firstName: "", lastName: "" },
  onReset: (values, options, e) => console.log("onReset: ", values), // Triggered on form reset
});

const handleFormReset = (e) => {
  reset(
    { firstName: "Welly", lastName: "Shen" }, // Update the default values
    ["isSubmitted", "submitCount"], // Don't reset the "isSubmitted" and "submitCount" state
    e // Pass the event object to the "onReset" handler
  );

  // We can also pass a callback as the "values" parameter, similar to React's setState callback style
  reset((prevValues) => ({ ...prevValues, firstName: "Bella" }));
};
```

Check the [Reset Form](../getting-started/reset-form) to learn more.

### controller

`(name: string, options?: Object) => { name: string, value: any, onChange: Function, onBlur: Function }`

Coming soon...
