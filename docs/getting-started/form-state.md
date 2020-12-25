---
id: form-state
title: Form State
slug: /form-state
---

Building highly performant forms is the duty of React Cool Form. It minimizes the number of re-renders and provides the best user experience by the following features:

- No unnecessary re-rendering by leveraging the power of [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html)
- Only triggers necessary re-rendering by **watching the changes of used form state**
- Filters the errors of untouched fields for better UX (refer the [theory](https://www.nngroup.com/articles/errors-forms-design-guidelines) at No.7)

Here we will explore the form state and some [best practices for using it](#use-form-state).

## About the Form State

Form state is an `object` containing the following values:

| Name         | Type      | Description                                                                                                                       |
| ------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| values       | `object`  | The current values of the form.                                                                                                   |
| errors       | `object`  | The current validation errors. [The shape will (should) match the shape of the form's values](./validation-guide#how-to-run).     |
| touched      | `object`  | An object containing all the fields the user has touched/visited.                                                                 |
| isDirty      | `boolean` | Returns `true` if the user modifies any of the fields. `false` otherwise.                                                         |
| dirtyFields  | `object`  | An object containing all the fields the user has modified.                                                                        |
| isValidating | `boolean` | Returns `true` if the form is currently being validated. `false` otherwise.                                                       |
| isValid      | `boolean` | Returns `true` if the form doesn't have any errors (the `errors` object is empty). `false` otherwise.                             |
| isSubmitting | `boolean` | Returns `true` if the form is currently being submitted. `false` if otherwise.                                                    |
| isSubmitted  | `boolean` | Returns `true` if the form has been submitted successfully. `false` if otherwise. Resets after calling [reset](./use-form#reset). |
| submitCount  | `number`  | Number of times the user tried to submit the form. Resets after calling [reset](./use-form#reset).                                |

> 🚨 The values of form state are readonly properties and should not be mutated directly.

## Use Form State

Coming soon...
