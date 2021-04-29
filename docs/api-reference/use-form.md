---
id: use-form
title: useForm
---

This is a custom React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that helps you with building forms. It takes `config` parameters and returns useful methods as follows.

```js
const methods = useForm(config);
```

## Config

An `object` with the following options:

### id

`string`

The ID of the hook, it's used to pair with the related hook(s) of React Cool Form. We only need it when using multiple form hooks at the same time.

### defaultValues

`Record<string, any>`

Default field values of the form. In most case (especially working with TypeScript), we should use it to initialize a field's value and use the [defaultValue/defaultChecked](https://reactjs.org/docs/uncontrolled-components.html#default-values) attribute for the case of [conditional fields](../examples/conditional-fields). The `defaultValues` also used to compare against the current values to calculate `isDirty` and `dirty`.

- The `defaultValues` is cached **at the first render** within the custom hook. If you want to reset it or [lazily set it](../examples/lazy-default-values), you can use the [reset](#reset) method.

### excludeFields

`string[]`

Tell React Cool Form to exclude field(s) by passing in the `name`/`id`/`class` of the field. You can also exclude a field via the pre-defined `data-rcf-exclude` attribute.

- The `excludeFields` and `data-rcf-exclude` won't affect the functionality of the [useControlled](./use-controlled).

```js {3,12}
const App = () => {
  const { form } = useForm({
    excludeFields: ["foo", "#bar", ".baz"],
  });

  return (
    <form ref={form}>
      <input name="foo" />
      <input id="bar" />
      <input className="baz" />
      {/* Excluding via the pre-defined data attribute */}
      <input data-rcf-exclude />
    </form>
  );
};
```

👉🏻 See the [Exclude Fields](../getting-started/integration-an-existing-form#exclude-fields) to learn more.

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

### focusOnError

`boolean | string[] | (names: string[]) => string[]`

Tell React Cool Form to apply focus to the first field with an error upon an attempted form submission. Default is `true`.

- Only native input elements that support [HTMLElement.focus()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus) will work.
- The focus order is based on the field order (i.e. top-to-bottom and left-to-right).

```js
// Current fields: { foo: "", bar: "", baz: "" }

// Disable this feature
const methods = useForm({ focusOnError: false });

// Change the focus order by passing in field names
const methods = useForm({ focusOnError: ["bar", "foo", "baz"] });

// Change the focus order by modifying existing field names
const methods = useForm({
  focusOnError: (names) => {
    [names[0], names[1]] = [names[1], names[0]];
    return names;
  },
});
```

### removeOnUnmounted

`boolean | string[] | (names: string[]) => string[]`

By default, React Cool Form automatically removes the **related state** (i.e. value, error, touched, dirty) and **default value** of an unmounted field for us. However, we can set the `removeOnUnmounted` to `false` to maintain all the data or give it field names to maintain partial data. Default is `true`.

- To keep a default value existing between a dynamically show/hide field, we can set it via `defaultValue` attribute or option.
- If this feature doesn't meet your needs, you can use the [removeField](#removefield) to control what data that you want to remove instead.

```js
// Current values: { foo: "🍎", bar: "🍋", baz: "🥝" }

// Keep all the data
const methods = useForm({ removeOnUnmounted: false });

// Keep partial data (i.e. "bar" and "baz") by passing in field names
const methods = useForm({ removeOnUnmounted: ["foo"] });

// Keep partial data (i.e. "bar" and "baz") by modifying existing field names
const methods = useForm({
  removeOnUnmounted: (names) => names.filter((name) => name === "foo"),
});
```

👉🏻 See the [conditional fields](../examples/conditional-fields) example to learn more.

### validate

`(values: FormValues) => FormErrors | false | void | Promise<FormErrors | false | void>`

A synchronous/asynchronous function that is used for the [form-level validation](../getting-started/validation-guide#form-level-validation). It takes all the form's values and returns any validation errors (or returns `undefined` if there's no error). The validation errors must be in the same shape as the values of the form.

### onSubmit

`(values: FormValues, options: Object, e?: Event) => void | Promise<void>`

The form submission handler will be called when the form is submitted (or when the [submit](#submit) method is called) and validated successfully. It takes the following parameters:

```js
const methods = useForm({
  onSubmit: async (values, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setDirty,
      setError,
      focus,
      runValidation,
      removeField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 See the [Form Submission](../getting-started/form-submission) to learn more.

### onError

`(errors: FormErrors, options: Object, e?: Event) => void`

The form error handler that is called when the form is submitted (or when the [submit](#submit) method is called) and validated failed. It takes the following parameters:

```js
const methods = useForm({
  onError: (errors, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setDirty,
      setError,
      focus,
      runValidation,
      removeField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 See the [Form Submission](../getting-started/form-submission) to learn more.

### onReset

`(values: FormValues, options: Object, e?: Event) => void`

The form reset handler that is called when the form is reset (or when the [reset](#reset) method is called). It takes the following parameters:

```js
const methods = useForm({
  onReset: (values, options, e) => {
    const {
      getState,
      setValue,
      setTouched,
      setDirty,
      setError,
      focus,
      runValidation,
      removeField,
      submit,
      reset,
    } = options;

    // ...
  },
});
```

👉🏻 See the [Reset Form](../getting-started/reset-form) to learn more.

### onStateChange

`(formState: FormState) => void`

The form state change handler that is called on every state change. It's useful for **debugging** or **triggering a handler**.

- Want to trigger a handler based on certain properties in the form state? Check out the [useFormState](./use-form-state) to learn more.
- `formState` is readonly and should not be mutated directly.

```js
const methods = useForm({
  onStateChange: (formState) => console.log("State: ", formState),
});
```

## Methods

An `object` with the following methods:

### form

`(element: HTMLElement) => void`

This method allows us to integrate [an existing form](../getting-started/integration-an-existing-form#hook-into-a-form) or [a container where inputs are used](../getting-started/integration-an-existing-form#without-using-a-form-element) with React Cool Form.

### field

`(validateOrOptions: Function | Object) => Function`

This method allows us to do [field-level validation](../getting-started/validation-guide#field-level-validation) and data type conversion via the `ref` attribute. For the data type conversion, React Cool Form supports the [valueAsNumber](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasnumber), [valueAsDate](https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html#dom-input-valueasdate), and custom parser.

- For your convenience, the values of `<input type="number">` and `<input type="radio">` are converted to `number` by default.
- When using this method with the [useControlled](./use-controlled), the functionality of the method will be replaced.

```js
const { field } = useForm();

<input
  name="foo"
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
<input nam="foo" ref={field((value) => !value.length && "Required")} />
```

### mon

`(path: string | string[] | Record<string, string>, options?: Object) => any`

Mon means "monitor", the method provides us a performant way to use the form state with minimized re-renders. See the [Form State](../getting-started/form-state) to learn more.

### focus

`(name: string, delay?: number) => void`

This method allows us to apply focus to a field. If you want to focus on the first field of a nested fields, you can just pass in the parent path as below.

:::note
When working with [Arrays and Lists](../getting-started/arrays-and-lists), we need to set `delay` (delay = 0 is acceptable) to wait for a field rendered before applying focus to it.
:::

```js {7,12}
const App = () => {
  const { form, focus } = useForm();

  useEffect(() => {
    // Will focuses on the first field after 0.5 second
    // It works the same as `focus("foo.a", 500)`
    focus("foo", 500);
  }, []);

  return (
    <form ref={form}>
      <input name="foo.a" />
      <input name="foo.b" />
      <input name="foo.c" />
      <input type="submit" />
    </form>
  );
};
```

👉🏻 See the [Applying Focus](../getting-started/arrays-and-lists#applying-focus) to learn more.

### getState

`(path?: string | string[] | Record<string, string>) => any`

This method allows us to read the form state without triggering re-renders. See the [Reading the State](../getting-started/form-state#reading-the-state) to learn more.

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

This method allows us to manually run validation for the form or field(s).

- It returns a `boolean` that indicates the validation results, `true` means valid, `false` otherwise.
- Please note, when enabling the [Filter Untouched Field Errors](../getting-started/form-state#filter-untouched-field-errors), only the errors of the touched fields are accessible.

```js
const { runValidation } = useForm();

// Validates the form (i.e. all the fields)
runValidation();

// Validates single field
runValidation("fieldName");

// Validates multiple fields
runValidation(["fieldName1", "fieldName2"]);

// With result
const validateForm = async () => {
  const isValid = await runValidation();
  console.log("The form is: ", isValid ? "valid" : "invalid");
};
```

👉🏻 See the [Validation Guide](../getting-started/validation-guide) to learn more.

### removeField

`(name: string, exclude?: string[]) => void`

This method allows us to manually remove the **related state** (i.e. value, error, touched, dirty) and **default value** of a field, it also excludes a field from the form.

- By default, React Cool Form automatically [removes an unmounted field](#removeonunmounted) for us but this method gives us the ability to control what data that we want to remove.

```js {4,10}
const App = () => {
  const [show, setShow] = useState(true);
  const { form, removeField } = useForm({
    removeOnUnmounted: false, // Disable the feature of automatically removing fields
  });

  const handleToggle = () => {
    setShow(!show);
    // We can exclude these data: ["defaultValue", "value", "error", "touched", "dirty"]
    if (!show) removeField("foo", ["defaultValue"]); // Keep the default value
  };

  return (
    <form ref={form}>
      <input type="checkbox" onChange={handleToggle} data-rcf-exclude />
      {show && <input name="foo" />}
      {/* Other fields... */}
    </form>
  );
};
```

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

👉🏻 See the [Form Submission](../getting-started/form-submission) to learn more.

### reset

`(values?: FormValues | Function | null, exclude?: string[] | null, e?: Event) => void`

This method allows us to manually reset the form. It will restore the form to its default values as well as reset/clear all the [related state](../getting-started/form-state#about-the-form-state).

- We can pass `values` as an optional parameter to update the default values.
- We can pass `exclude` as an optional parameter to prevent specific [state](../getting-started/form-state#about-the-form-state) from reset.

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

👉🏻 See the [Reset Form](../getting-started/reset-form) to learn more.
