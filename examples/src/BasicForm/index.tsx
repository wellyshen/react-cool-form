/** @jsxImportSource @emotion/core */

import React, { useState, useEffect, useCallback } from "react";
import { useForm, get, set } from "react-cool-form";
import * as Yup from "yup";

import Input from "./Input";
import Controller from "./Controller";
import Select from "./Select";
import TextArea from "./TextArea";
import { container, form, wrapper } from "./styles";

const fib = (n: number): number => (n < 3 ? 1 : fib(n - 2) + fib(n - 1));

export interface FormValues {
  text: Record<string, string>;
  controller1: any;
  controller2: any;
  hiddenText1: string;
  hiddenText2: string;
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

const defaultValues = {
  text: { nest: "new test" },
  // controller1: "new test",
  controller2: "new test",
  hiddenText1: "new test",
  hiddenText2: "new test",
  password: "new test",
  number: 5,
  range: 0,
  checkbox: true,
  checkboxGroup: ["value-1"],
  radio: "value-1",
  image: [],
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
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
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
    submit,
  } = useForm<FormValues>({
    defaultValues,
    // validateOnChange: false,
    // validateOnBlur: false,
    // ignoreFields: ["text.nest", "number"],
    // validate: async (values) => {
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
      /* await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      }); */

      console.log("LOG ===> onSubmit: ", values);
    },
    onError: (errors, options, e) =>
      console.log("LOG ===> onError: ", errors, options, e),
    // debug: (formState) => console.log("LOG ===> debug: ", formState),
  });

  // console.log("LOG ===> Re-render");
  // console.log("LOG ===> formState: ", getState("values.text.nest"));
  console.log(
    "LOG ===> formState: ",
    getState({
      values: "values",
      // touched: "touched",
      // errors: "errors",
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

  const handleToggle1Click = (): void => setShow1(!show1);

  const handleToggle2Click = (): void => setShow2(!show2);

  const handleSetValueClick = (): void => {
    /* setValues(
      (prevValues) => ({
        ...prevValues,
        text: { nest: "new test" },
        number: 123,
      }),
      {
        touchedFields: ["text.nest"],
        dirtyFields: ["text.nest"],
      }
    ); */

    // setFieldValue("text.nest", (prevValue: string) => `new ${prevValue}`);
    // setFieldValue("text.nest", "new test");
    // setFieldValue("hiddenText", "new test");
    // setFieldValue("password", "");
    // setFieldValue("number", 456);
    // setFieldValue("checkbox", false);
    // setFieldValue("checkboxGroup", ["value-2"]);
    // setFieldValue("radio", "value-2");
    // setFieldValue("multiSelect.nest", ["value-2"]);
    setFieldValue("image", "abc");
  };

  const handleSetErrorsClick = (): void => {
    setFieldError("number", "Error");
    // setFieldError("text.nest", "Required");
    // setFieldError("hiddenText", (prevMsg) => `new ${prevMsg}`);
  };

  const handleClearErrorsClick = (): void => {
    setFieldError("number");
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

  const handleSubmit = async () => {
    const res = await submit();
    console.log("LOG ===> ", res);
  };

  return (
    <div css={container}>
      <form css={form} noValidate ref={formRef}>
        <Input
          label="Text:"
          name="text.nest"
          /* ref={validate(async (value) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            return value.length <= 5 ? "Field error" : "";
          })} */
          // required
          // data-rcf-ignore
          defaultValue="test"
        />
        {!show1 && (
          <Input
            label="Controller 1:"
            type="checkbox"
            {...controller("controller1", { defaultValue: true })}
            // defaultChecked
          />
        )}
        <Controller
          label="Controller 2:"
          name="controller2"
          // eslint-disable-next-line react-hooks/exhaustive-deps
          controller={controller}
          /* validate={useCallback(async (val, values) => {
            // eslint-disable-next-line
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // console.log("LOG ===> validate: ", val, values);
            return val.length <= 5 ? "Field error" : "";
          }, [])} */
          required
          defaultValue={defaultValues.controller2}
        />
        {show1 && (
          <div>
            <Input
              label="Hidden Text 1:"
              name="hiddenText1"
              /* ref={validate(async (value) => {
                return value.length <= 5 ? "Field error" : "";
              })} */
              defaultValue="test"
            />
          </div>
        )}
        {show2 && (
          <div>
            <Input
              label="Hidden Text 2:"
              name="hiddenText2"
              /* ref={validate(async (value) => {
                return value.length <= 5 ? "Field error" : "";
              })} */
              defaultValue="test"
            />
          </div>
        )}
        <Input
          label="Password:"
          type="password"
          name="password"
          defaultValue="test"
        />
        <Input
          label="Number:"
          type="number"
          name="number"
          /* ref={validate((value) => {
            return value <= 5 ? "Field error" : "";
          })} */
          defaultValue="5"
        />
        <Input label="Range:" type="range" name="range" defaultValue="0" />
        <Input
          label="Checkbox:"
          type="checkbox"
          name="checkbox"
          defaultChecked
        />
        <div css={wrapper}>
          <Input
            id="checkboxGroup-1"
            label="Checkbox 1:"
            type="checkbox"
            name="checkboxGroup"
            value="value-1"
            // defaultChecked
          />
          <Input
            id="checkboxGroup-2"
            label="Checkbox 2:"
            type="checkbox"
            name="checkboxGroup"
            value="value-2"
            defaultChecked
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
            defaultChecked
          />
        </div>
        <Input label="File:" type="file" name="image" />
        <Select label="Select:" name="select" defaultValue="value-2">
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <Select
          label="Multi-select:"
          name="multiSelect.nest"
          multiple
          defaultValue={["value-1", "value-2"]}
        >
          <option value="value-1">Value 1</option>
          <option value="value-2">Value 2</option>
        </Select>
        <TextArea label="Text Area:" name="textarea" defaultValue="test" />
        <button type="button" onClick={handleToggle1Click}>
          Toggle 1
        </button>
        <button type="button" onClick={handleToggle2Click}>
          Toggle 2
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
          Reset
        </button>
        <button type="button" onClick={handleSubmit}>
          My Submit
        </button>
        <input type="submit" />
        <input type="reset" onClick={(e) => reset(null, null, e)} />
      </form>
    </div>
  );
};
