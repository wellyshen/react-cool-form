> 🚨 Under developing the API may be changed fast, **don't use it in production atm**. Please note any changes via [release](https://github.com/wellyshen/react-cool-form/releases). Here's the [milestone](#milestone).

# <b>REACT COOL FORM</b>

React hooks for forms state and validation, less code more performant.

[![npm version](https://img.shields.io/npm/v/react-cool-form?style=flat-square)](https://www.npmjs.com/package/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dm/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-form?style=flat-square)](https://www.npmtrends.com/react-cool-form)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-cool-form?style=flat-square)](https://bundlephobia.com/result?p=react-cool-form)

## Milestone

- [x] Core features
- [x] Type definition
- [x] Support server-side rendering
- [x] CI/CD
- [ ] Documentation (in-progress...)
- [ ] Unit testing (in-progress...)
- [ ] Examples
- [ ] End to end testing

## Getting Started

To use `react-cool-form`, you must use `react@16.8.0` or greater which includes hooks.

You can install this package via [npm](https://www.npmjs.com/package/react-cool-form).

```sh
$ yarn add react-cool-form
# or
$ npm install --save react-cool-form
```

Here's the basic example of how does it works, full documentation will be provided soon. If you have any question, feel free to [ask me](https://github.com/wellyshen/react-cool-form/issues/new?template=question.md).

[![Edit useForm - basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-cool-form-basic-gb0dj?fontsize=14&hidenavigation=1&theme=dark)

```js
import { useForm } from "react-cool-form";

const App = () => {
  const { formRef, getState } = useForm({
    // Provide the default values of the form state
    // just like we use "React.useState" or "React.useReducer"
    defaultValues: { name: "", email: "", password: "" },
    // The event only triggered when the form is valid
    onSubmit: (values, actions) => {
      console.log("onSubmit: ", values);
    },
  });

  const errors = getState(
    "errors",
    // react-cool-form auto filters the errors before a field is blurred
    // Which helps the user focus on typing without being annoying
    { filterUntouchedErrors: true }
  );

  return (
    <form ref={formRef} noValidate>
      <label>Name</label>
      {/* Support built-in validation attributes */}
      <input name="name" required />
      {errors.name && <p>{errors.name}</p>}

      <label>Email</label>
      <input name="email" type="email" required />
      {errors.email && <p>{errors.email}</p>}

      <label>Password</label>
      <input name="password" type="password" required minLength={8} />
      {errors.password && <p>{errors.password}</p>}

      <input type="reset" />
      <input type="submit" />
    </form>
  );
};
```

The form state of the above example will look something like this:

```json
{
  "values": {
    "name": "Welly",
    "email": "hivoid19@gmail.com",
    "password": "12345"
  },
  "touched": {
    "name": true,
    "email": true,
    "password": true
  },
  "isValidating": false,
  "isValid": false,
  "errors": {
    "password": "Please lengthen this text to 8 characters or more"
  },
  "isDirty": true,
  "dirtyFields": {
    "name": true,
    "email": true,
    "password": true
  },
  "isSubmitting": false,
  "isSubmitted": false,
  "submitCount": 1
}
```

Super easy right? The above example is just the tip of the iceberg. `react-cool-form` is a lightweight and powerful form library. you can understand the **API** by its type definition atm to see how it rocks 🤘🏻.

```ts
import { FocusEvent, RefObject, SyntheticEvent } from "react";

type FormValues = Record<string, any>;

type DeepProps<V, T = any> = {
  [K in keyof V]?: V[K] extends T ? T : DeepProps<V[K]>;
};

type Errors<V> = DeepProps<V>;

type FormState<V = FormValues> = Readonly<{
  values: V;
  touched: DeepProps<V, boolean>;
  errors: Errors<V>;
  isDirty: boolean;
  dirtyFields: DeepProps<V, boolean>;
  isValidating: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;
}>;

type Options<V> = Omit<
  Return<V>,
  "formRef" | "validate" | "submit" | "controller"
>;

interface OnReset<V = FormValues> {
  (
    values: V,
    options: Omit<Options<V>, "reset">,
    event?: Event | SyntheticEvent<any>
  ): void;
}

interface OnSubmit<V = FormValues> {
  (
    values: V,
    options: Options<V>,
    event?: Event | SyntheticEvent<any>
  ): void | Promise<void>;
}

interface OnError<V = FormValues> {
  (
    errors: Errors<V>,
    options: Options<V>,
    event?: Event | SyntheticEvent<any>
  ): void;
}

interface Debug<V> {
  (formState: FormState<V>): void;
}

interface FormValidator<V = FormValues> {
  (values: V): Errors<V> | void | Promise<Errors<V> | void>;
}

interface FieldValidator<V = FormValues> {
  (value: any, values: V): any | Promise<any>;
}

interface ValidateRef<V> {
  (validate: FieldValidator<V>): (
    field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  ) => void;
}

interface GetState {
  (
    path: string | string[] | Record<string, string>,
    options?: {
      target?: string;
      watch?: boolean;
      filterUntouchedErrors?: boolean;
    }
  ): any;
}

interface SetErrors<V> {
  (
    errors?: Errors<V> | ((previousErrors: Errors<V>) => Errors<V> | undefined)
  ): void;
}

interface SetFieldError {
  (name: string, error?: any | ((previousError?: any) => any)): void;
}

type ValuesArg<V> = V | ((previousValues: V) => V);

interface SetValues<V> {
  (
    values: ValuesArg<V>,
    options?: {
      shouldValidate?: boolean;
      touchedFields?: string[];
      dirtyFields?: string[];
    }
  ): void;
}

interface SetFieldValue {
  (
    name: string,
    value: any | ((previousValue: any) => any),
    options?: {
      [k in "shouldValidate" | "shouldTouched" | "shouldDirty"]?: boolean;
    }
  ): void;
}

interface ValidateForm<V> {
  (): Promise<Errors<V>>;
}

interface ValidateField<V> {
  (name: string): Promise<Errors<V>>;
}

interface Reset<V> {
  (
    values?: ValuesArg<V> | null,
    exclude?: (keyof FormState<V>)[] | null,
    event?: SyntheticEvent<any>
  ): void;
}

interface Submit<V> {
  (event?: SyntheticEvent<any>): Promise<{ values?: V; errors?: Errors<V> }>;
}

interface Parse<V = any, R = any> {
  (value: V): R;
}

type Format<V = any, R = any> = Parse<V, R>;

interface OnChange<E = any> {
  (event: E, value?: any): void;
}

interface OnBlur {
  (event: FocusEvent<any>): void;
}

interface Controller<V = FormValues, E = any> {
  (
    name: string,
    options?: {
      validate?: FieldValidator<V>;
      value?: any;
      defaultValue?: any;
      parse?: Parse;
      format?: Format;
      onChange?: OnChange<E>;
      onBlur?: OnBlur;
    }
  ): {
    name: string;
    value: any;
    onChange: (event: E) => void;
    onBlur: OnBlur;
  } | void;
}

interface Config<V = FormValues> {
  defaultValues: V;
  validate?: FormValidator<V>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  ignoreFields?: string[];
  onReset?: OnReset<V>;
  onSubmit?: OnSubmit<V>;
  onError?: OnError<V>;
  debug?: Debug<V>;
}

interface Return<V = FormValues> {
  formRef: RefObject<HTMLFormElement>;
  validate: ValidateRef<V>;
  getState: GetState;
  setErrors: SetErrors<V>;
  setFieldError: SetFieldError;
  setValues: SetValues<V>;
  setFieldValue: SetFieldValue;
  validateForm: ValidateForm<V>;
  validateField: ValidateField<V>;
  reset: Reset<V>;
  submit: Submit<V>;
  controller: Controller<V>;
}

const useForm: <V extends FormValues = FormValues>(
  config: Config<V>
) => Return<V>;

const get: (object: any, path: string, defaultValue?: unknown) => any;

const set: (
  object: any,
  path: string,
  value: unknown,
  immutable?: boolean
) => any;

const unset: (object: any, path: string, immutable?: boolean) => any;
```
