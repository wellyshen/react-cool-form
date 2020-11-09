/** @jsxImportSource @emotion/core */

import React, { useState, useEffect } from "react";
import { useForm } from "react-cool-form";
import * as Yup from "yup";

import Input from "./Input";
import Controller from "./Controller";
import Select from "./Select";
import TextArea from "./TextArea";
import { container, form, wrapper } from "./styles";

const fib = (n: number): number => (n < 3 ? 1 : fib(n - 2) + fib(n - 1));

export interface FormValues {
  text: Record<string, string>;
  controller: any;
  hiddenText: string;
  password: string;
  number: number;
  range: number;
  checkbox: boolean;
  checkboxGroup: string[];
  radio: string;
  image: any;
  select: string;
  multiSelect: Record<string, string[]>;
  textarea: string;
}

const initialValues = {
  text: { nest: "test" },
  controller: "test",
  hiddenText: "test",
  password: "test",
  number: 5,
  range: 0,
  checkbox: true,
  checkboxGroup: ["value-1"],
  radio: "value-1",
  image: "",
  select: "value-2",
  multiSelect: { nest: ["value-1", "value-2"] },
  textarea: "test",
};

const schema = Yup.object().shape({
  text: Yup.object()
    .shape({
      nest: Yup.string().required(),
    })
    .required(),
  number: Yup.number().min(100).required(),
});

export default (): JSX.Element => {
  const [showInput, setShowInput] = useState(false);
  const {
    formRef,
    validate,
    getState,
    setValues,
    setFieldValue,
    setErrors,
    setFieldError,
    validateField,
    validateForm,
    controller,
    reset,
    handleReset,
    handleSubmit,
  } = useForm<FormValues>({
    initialValues,
    // validateOnChange: false,
    // validateOnBlur: false,
    ignoreFields: ["text.nest", "number"],
    // validate: async (values, set) => {
    //   let errors: any = { text: { nest: "" } };

    //   // fib(35);

    //   // eslint-disable-next-line
    //   /* await new Promise((resolve) => {
    //     setTimeout(resolve, 3000);
    //   }); */

    //   // if (text.nest.length <= 3) set(errors, "text.nest", "Form error");
    //   if (values.text.nest.length <= 5) {
    //     errors.text.nest = "Form error";
    //   } else {
    //     errors = {};
    //   }
    //   // if (hiddenText.length <= 3) errors.hiddenText = "Form error";

    //   // throw new Error("Fake error");
    //   return errors;

    //   /* try {
    //     await schema.validate(values, { abortEarly: false });
    //   } catch (error) {
    //     const formErrors = {};

    //     error.inner.forEach(({ path, message }: any) =>
    //       set(formErrors, path, message)
    //     );

    //     return formErrors;
    //   } */
    // },
    onReset: (values, options, e) =>
      console.log("LOG ===> onReset: ", values, options, e),
    onSubmit: async (values, options, e) => {
      // eslint-disable-next-line
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });

      console.log("LOG ===> onSubmit: ", values, options, e);
    },
    onError: (errors, options, e) =>
      console.log("LOG ===> onError: ", errors, options, e),
    // debug: (formState) => console.log("LOG ===> debug: ", formState),
  });

  // console.log("LOG ===> Re-render");
  console.log(
    "LOG ===> formState: ",
    getState({
      // values: "values",
      // touched: "touched",
      errors: "errors",
      // isDirty: "isDirty",
      // dirtyFields: "dirtyFields",
      // isValidating: "isValidating",
      // isValid: "isValid",
      // isSubmitting: "isSubmitting",
      // isSubmitted: "isSubmitted",
      // submitCount: "submitCount",
    })
  );

  useEffect(() => {
    // validateField("text.nest");
    // validateForm();
  }, []);

  const handleToggleInputClick = (): void => setShowInput(!showInput);

  const handleSetValueClick = (): void => {
    setValues(
      (prevValues) => ({
        ...prevValues,
        text: { nest: "new test" },
        number: 123,
      }),
      {
        touchedFields: ["text.nest"],
        dirtyFields: ["text.nest"],
      }
    );

    // setFieldValue("text.nest", (prevValue: string) => `new ${prevValue}`);
    // setFieldValue("text.nest", "new test");
    // setFieldValue("hiddenText", "new test");
    // setFieldValue("password", "");
    // setFieldValue("number", 456);
    // setFieldValue("checkbox", false);
    // setFieldValue("checkboxGroup", ["value-2"]);
    // setFieldValue("radio", "value-2");
    // setFieldValue("multiSelect.nest", ["value-2"]);
  };

  const handleSetErrorsClick = (): void => {
    setFieldError("text", false);
    // setFieldError("text.nest", "Required");
    // setFieldError("hiddenText", (prevMsg) => `new ${prevMsg}`);
  };

  const handleClearErrorsClick = (): void => {
    setFieldError("text.nest");
  };

  const handleValidateClick = (): void => {
    validateField("text.nest");
  };

  const handleResetClick = (): void => {
    reset((prevValues) => ({ ...prevValues, text: { nest: "new test" } }), [
      "touched",
      "submitCount",
    ]);
  };

  return (
    <div css={container}>
      <form
        css={form}
        onSubmit={handleSubmit}
        onReset={handleReset}
        noValidate
        ref={formRef}
      >
        <Input
          label="Text:"
          name="text.nest"
          /* ref={validate(async (value) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            return value.length <= 5 ? "Field error" : "";
          })} */
          // data-rcf-ignore
        />
        <Controller
          label="Controller:"
          name="controller"
          defaultValue={initialValues.controller}
          controller={controller}
          /* validate={useCallback(async (val, values) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // console.log("LOG ===> validate: ", val, values);
            return val.length <= 5 ? "Field error" : "";
          }, [])} */
        />
        {showInput && (
          <div>
            <Input
              label="Hidden Text:"
              name="hiddenText"
              ref={validate(async (value) => {
                return value.length <= 5 ? "Field error" : "";
              })}
            />
          </div>
        )}
        {/* <Input label="Password:" type="password" name="password" /> */}
        <Input
          label="Number:"
          type="number"
          name="number"
          /* ref={validate((value) => {
            return value <= 5 ? "Field error" : "";
        })} */
        />
        <Input label="Range:" type="range" name="range" />
        <Input label="Checkbox:" type="checkbox" name="checkbox" />
        <div css={wrapper}>
          <Input
            id="checkboxGroup-1"
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="value-1"
          />
          <Input
            id="checkboxGroup-2"
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="value-2"
          />
        </div>
        <div css={wrapper}>
          <Input
            id="radio-1"
            label="Radio 1:"
            type="radio"
            name="radio"
            value="value-1"
          />
          <Input
            id="radio-2"
            label="Radio 2:"
            type="radio"
            name="radio"
            value="value-2"
          />
        </div>
        <Input label="File:" type="file" name="image" />
        <Select label="Select:" name="select">
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <Select label="Multi-select:" name="multiSelect.nest" multiple>
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" />
        <button type="button" onClick={handleToggleInputClick}>
          Toggle Input
        </button>
        <button type="button" onClick={handleSetValueClick}>
          Set Values
        </button>
        <button type="button" onClick={handleSetErrorsClick}>
          Set Errors
        </button>
        <button type="button" onClick={handleClearErrorsClick}>
          Clear Errors
        </button>
        <button type="button" onClick={handleValidateClick}>
          Validate
        </button>
        <button type="button" onClick={handleResetClick}>
          Reset Method
        </button>
        <input type="submit" />
        <input type="reset" />
      </form>
    </div>
  );
};
