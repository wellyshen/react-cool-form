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

### id

`string`

The ID of the hook, it's only be used when working with the related hook(s) of React Cool Form.

### defaultValues

`Record<string, any>`

Default field values of the form. In most case (especially working with TypeScript), we should use it to initialize a field's value and use the [defaultValue/defaultChecked](https://reactjs.org/docs/uncontrolled-components.html#default-values) attribute for the case of [conditional fields](../examples/conditional-fields). The `defaultValues` also used to compare against the current values to calculate `isDirty` and `dirty`.

- The `defaultValues` is cached **at the first render** within the custom hook. If you want to reset it or [lazily set it](../examples/lazy-default-values), you can use the [reset](#reset) method.

### excludeFields

`string[]`

Tell React Cool Form to exclude field(s) by passing in the `name` of the field. You can also exclude a field via the pre-defined `data-rcf-exclude` attribute. Check the [Exclude Fields](../getting-started/integration-an-existing-form#exclude-fields) to learn more.

- The `excludeFields` and `data-rcf-exclude` won't affect the operation of the [controller](#controller).

### shouldRemoveField

`boolean`

By default, React Cool Form auto removes the related state (i.e. `values`, `errors`, `touched`, `dirty`) of an unmounted field for us. However, we can set the `shouldRemoveField` to `false` to maintain the state. Check the [conditional fields](../examples/conditional-fields) example to learn more. Default is `true`.

- If the field isn't a form input element (i.e. [input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), and [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)) or [controller](#controller)'s target. We need to clear the related state by ourselves.

### builtInValidationMode

`"message" | "state" | false`

We can configure the [mode of the built-in validation](../getting-started/validation-guide#displaying-error-messages) as follows:

- `"message"` (default): Returns [a localized message](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage) that describes the validation constraints that the field does not satisfy (if any)
- `"state"`: Returns the **key of the invalid property** (e.g. "valueMissing", "tooShort" etc.) of the [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) (if any)
- `false`: Disable the [built-in validation](../getting-started/validation-guide#built-in-validation)

### validateOnChange

`boolean`

Tell React Cool Form to run validations on `change` events as well as the [setValue](#setvalue) method. Default is `true`.

### validateOnBlur

`boolean`

Tell React Cool Form to run validations on `blur` events. Default is `true`.

### validate

`(values: FormValues) => FormErrors | false | void | Promise<FormErrors | false | void>`

A synchronous/asynchronous function that is used for the [form-level validation](../getting-started/validation-guide#form-level-validation). It takes all the `values` of the form and returns any validation errors (or returns `undefined` if there's no error). The validation errors must be in the same shape as the values of the form.

### onSubmit

`(values: FormValues, options: Object, e?: Event) => void | Promise<void>`

The form submission handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated successfully. It takes the following parameters:

```js
const returnValues = useForm({
  onSubmit: async (values, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setError,
      runValidation,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 Check the [Form Submission](../getting-started/form-submission) to learn more.

### onError

`(errors: FormErrors, options: Object, e?: Event) => void`

The form error handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated failed. It takes the following parameters:

```js
const returnValues = useForm({
  onError: (errors, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setError,
      runValidation,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 Check the [Form Submission](../getting-started/form-submission) to learn more.

### onReset

`(values: FormValues, options: Object, e?: Event) => void`

The form reset handler that is called when the form is reset (or when the [reset](#reset) method is called). It takes the following parameters:

```js
const returnValues = useForm({
  onReset: (values, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setError,
      runValidation,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 Check the [Reset Form](../getting-started/reset-form) to learn more.

### debug

A callback for debugging that receives the form state. It's called on every state change.

`(formState: FormState) => void`

- `formState` is readonly and should not be mutated directly.

```js
const returnValues = useForm({
  debug: (formState) => console.log("Debug: ", formState),
});
```

## Return Values

An `object` with the following methods:

### form

`(element: HTMLElement) => void`

This method allows us to integrate [an existing form](../getting-started/integration-an-existing-form#hook-into-a-form) or [a container where inputs are used](../getting-started/integration-an-existing-form#without-using-a-form-element) with React Cool Form.

### field

`(validateOrOptions: Function | Object) => Function`

This method allows us to do [field-level validation](../getting-started/validation-guide#field-level-validation) and data type conversion via the `ref` attribute. For the data type conversion, React Cool Form supports the [valueAsNumber](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasnumber), [valueAsDate](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasdate), and custom parser.

- For your convenience, the values of `<input type="number">` and `<input type="radio">` are converted to `number` by default.
- When using this method with the [controller](#controller), the functionality of the method will be replaced.

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

### select

`(path: string | string[] | Record<string, string>, options?: Object) => any`

This method provides us a performant way to use the form state. Check the [Form State](../getting-started/form-state) to learn more.

### getState

`(path?: string | string[] | Record<string, string>, target?: string) => any`

This method allows us to read the form state without triggering re-renders. Check the [Reading the State](../getting-started/form-state#reading-the-state) to learn more.

### setValue

`(name: string, value: any | Function, options?: Object) => void`

This method allows us to manually set/clear the value of a field. Useful for creating custom field change handlers.

```js
const { setValue } = useForm();

setValue("fieldName", "value", {
  shouldValidate: true, // (Default = "validateOnChange" option) Triggers field validation
  shouldTouched: true, // (Default = true) Sets the field as touched
  shouldDirty: true, // (Default = true) Sets the field as dirty
});

// We can also pass a callback as the "value" parameter, similar to React's setState callback style
setValue("fieldName", (prevValue) => prevValue.splice(2, 0, "🍎"));
```

We can clear the value of a field by the following way:

```js
setValue("fieldName", undefined); // The field will be unset: { fieldName: "value" } → {}
```

### setTouched

`(name: string, isTouched?: boolean, shouldValidate?: boolean) => void`

This method allows us to manually set/clear the touched of a field. Useful for creating custom field touched handlers.

```js
const { setTouched } = useForm();

// Common use case
setTouched("fieldName");

// Full parameters
setTouched(
  "fieldName",
  true, // (Default = true) Sets the field as touched
  true // (Default = "validateOnBlur" option) Triggers field validation
);
```

We can clear the touched of a field by the following way:

```js
setTouched("fieldName", false); // The touched will be unset: { fieldName: true } → {}
```

### setDirty

`(name: string, isDirty?: boolean) => void`

This method allows us to manually set/clear the dirty of a field. Useful for creating custom field dirty handlers.

```js
const { setDirty } = useForm();

// Common use case
setDirty("fieldName");
```

We can clear the dirty of a field by the following way:

```js
setDirty("fieldName", false); // The dirty will be unset: { fieldName: true } → {}
```

### setError

`(name: string, error: any | Function) => void`

This method allows us to manually set/clear the error of a field. Useful for creating custom field error handlers.

```js
const { setError } = useForm();

setError("fieldName", "Required");

// We can also pass a callback as the "error" parameter, similar to React's setState callback style
setError("fieldName", (prevError) => (prevError ? "Too short" : "Required"));
```

We can clear the error of a field by the following way (or using [clearErrors](#clearerrors)):

```js
setError("fieldName", undefined); // Or any falsy values, the error will be unset: { fieldName: "Required" } → {}
```

### clearErrors

`(name?: string | string[]) => void`

This method allows us to manually clear errors (or an error). Useful for creating custom field error handlers.

```js
const { clearErrors } = useForm();

// Current errors: { foo: { bar: "Required", baz: "Required" }, qux: "Required" }

clearErrors(); // Clears all errors. Result: {}

clearErrors("foo"); // Clears both "foo.bar" and "foo.baz". Result: { qux: "Required" }

clearErrors(["foo.bar", "foo.baz"]); // Clears "foo.bar" and "foo.baz" respectively. Result: { foo: {}, qux: "Required" }
```

### runValidation

`(name?: string | string[]) => Promise<boolean>`

This method allows us to manually run validation for the field(s) or form. It returns a boolean that indicates the validation results, `true` means valid, `false` otherwise.

- Please note, when enabling the [Filter Untouched Field Errors](../getting-started/form-state#filter-untouched-field-errors), only the errors of the touched fields are accessible.

```js
const { runValidation } = useForm();

// Validates the form (i.e. all the fields)
runValidation();

// Validates a single field
runValidation("fieldName");

// Validates multiple fields
runValidation(["fieldName1", "fieldName2"]);

// With result
const validateForm = async () => {
  const valid = await runValidation();
  console.log("The form is: ", valid ? "valid" : "invalid");
};
```

👉🏻 Check the [Validation Guide](../getting-started/validation-guide) to learn more.

### submit

`(e?: Event) => Promise<Result>`

This method allows us to manually submit the form, it returns a promise with the following results. Useful for meeting the needs of custom design.

- Returns a promise with `errors` when any validation errors
- Returns a promise with `values` when the form is validated successfully

```js
const { submit } = useForm({
  onSubmit: (values, options, e) => console.log("onSubmit: ", values), // Triggered on form submit + valid
  onError: (errors, options, e) => console.log("onError: ", errors), // Triggered on form submit + invalid
});

const handleFormSubmit = async (e) => {
  const { errors, values } = await submit(e); // Pass the event object to the event handlers

  if (errors) {
    // Do something for invalid case
  } else {
    // Do something for valid case
  }
};
```

👉🏻 Check the [Form Submission](../getting-started/form-submission) to learn more.

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

👉🏻 Check the [Reset Form](../getting-started/reset-form) to learn more.

### controller

`(name: string, options?: Object) => Props`

This method allows us to integrate with an existing component (usually a [controlled component](https://reactjs.org/docs/forms.html#controlled-components)) or 3rd-party UI library in React Cool Form. The API as follows:

#### Parameters

To use the `controller`, you **must pass in the field's name** to the first argument. The `options` containing the following optional properties:

| Name         | Type       | Description                                                                                                                                                                                                                                                                                          |
| ------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| validate     | `function` | A synchronous/asynchronous function that is used for the [field-level validation](../getting-started/validation-guide#field-level-validation).                                                                                                                                                       |
| value        | `any`      | A given value of the field for UI rendering. Useful for [isolating re-rendering at the component level](../getting-started/3rd-party-ui-libraries#2-controller-api) for better performance.                                                                                                          |
| defaultValue | `any`      | The default value of the field. Useful for dealing with the case of [conditional fields](../examples/conditional-fields).                                                                                                                                                                            |
| parse        | `function` | A function that takes all the arguments of the target component's `onChange` handler and parses the value of the field that you want to store into the [form state](../getting-started/form-state). Useful for data type converting.                                                                 |
| format       | `function` | A function that takes the field's value from the [form state](../getting-started/form-state) and formats the value to give to the field. Usually used in conjunction with `parse`.                                                                                                                   |
| onChange     | `function` | The `onChange` handler of the target component. React Cool Form appends the field's value to the last argument, i.e. `(...args, fieldValue) => void`. Useful for [isolating re-rendering at the component level](../getting-started/3rd-party-ui-libraries#2-controller-api) for better performance. |
| onBlur       | `function` | The `onBlur` handler of the target component.                                                                                                                                                                                                                                                        |

#### Return Props

It returns the following props:

| Name     | Type       | Description                                          |
| -------- | ---------- | ---------------------------------------------------- |
| name     | `string`   | The field's name.                                    |
| value    | `any`      | The field's value.                                   |
| onChange | `function` | Event handler called when the field's value changed. |
| onChange | `function` | Event handler called when the field loses focus.     |

#### Basic Usage

The following code demonstrates a basic use case:

```js
// (Strongly advise) Provide a default value for the controlled field
const { controller } = useForm({ defaultValues: { fieldName: "" } });

// With built-in validation (if supported)
<Component {...controller("fieldName")} required />;

// With custom validation
<Component
  {...controller("fieldName", {
    validate: (value, values /* Form's values */) =>
      !value.length && "Required",
  })}
  required
/>;
```

👉🏻 Check the [3rd-Party UI Libraries](../getting-started/3rd-party-ui-libraries) to learn more.
